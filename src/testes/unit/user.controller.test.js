import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getMockReq, getMockRes } from '@jest-mock/express';
import userController from '../../controller/user.controller.js';
import { createUser, findUserByUsername, findUserByEmail } from '@services/user.service.js';
import db from '@models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('@services/user.service.js', () => ({
  createUser: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByEmail: jest.fn(),
}));

jest.mock('@models/index.js', () => ({
  __esModule: true,
  default: {
    users: {
      findOne: jest.fn(),
      find: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('User Controller', () => {
  let req;
  let res;
  let next;
  const mockJwtSecret = 'test-secret-for-jwt';

  beforeEach(() => {
    req = getMockReq();
    ({ res, next } = getMockRes());
    jest.clearAllMocks();
    process.env.JWT_SECRET = mockJwtSecret;
  });

  describe('register', () => {
    const validReqBody = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should register a user successfully and return 201', async () => {
      req.body = validReqBody;
      findUserByEmail.mockResolvedValue(null);
      findUserByUsername.mockResolvedValue(null);
      createUser.mockResolvedValue({ id: 1, ...validReqBody });

      await userController.register(req, res);

      expect(findUserByEmail).toHaveBeenCalledWith(validReqBody.email);
      expect(findUserByUsername).toHaveBeenCalledWith(validReqBody.username);
      expect(createUser).toHaveBeenCalledWith(validReqBody);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { username: 'test' };

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'username, email and password are required' });
      expect(createUser).not.toHaveBeenCalled();
    });

     it('should return 400 if req.body is missing', async () => {
      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'username, email and password are required' });
    });

    it('should return 400 if email already exists', async () => {
      req.body = validReqBody;
      findUserByEmail.mockResolvedValue({ id: 2, email: validReqBody.email });
      findUserByUsername.mockResolvedValue(null);


      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username or email already exists' });
      expect(createUser).not.toHaveBeenCalled();
    });

    it('should return 400 if username already exists', async () => {
        req.body = validReqBody;
        findUserByEmail.mockResolvedValue(null);
        findUserByUsername.mockResolvedValue({ id: 2, username: validReqBody.username });

        await userController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Username or email already exists' });
        expect(createUser).not.toHaveBeenCalled();
    });

    it('should return 500 if createUser service throws an error', async () => {
      req.body = validReqBody;
      findUserByEmail.mockResolvedValue(null);
      findUserByUsername.mockResolvedValue(null);
      const dbError = new Error('Database save error');
      createUser.mockRejectedValue(dbError);

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: `Error saving user: ${dbError}` });
    });
  });

  describe('login', () => {
    const loginUserDbData = {
      id: 'user123',
      username: 'loginuser',
      email: 'login@example.com',
      password: 'hashedPassword123',
    };

    it('should login a user successfully and return 200 with token', async () => {
      req.body = { username: 'loginuser', password: 'password123' };
      db.users.findOne.mockResolvedValue(loginUserDbData);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockedToken123');

      await userController.login(req, res);

      expect(db.users.findOne).toHaveBeenCalledWith({ where: { username: req.body.username } });
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, loginUserDbData.password);
      expect(jwt.sign).toHaveBeenCalledWith({ id: loginUserDbData.id }, mockJwtSecret, { expiresIn: '1h' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Login successful', token: 'mockedToken123' });
    });

    it('should return 400 if username or password missing (first check)', async () => {
        req.body = { username: 'loginuser' }
        await userController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'username, email and password are required' });
    });

    it('should return 400 if (no email AND no username) OR no password (second check)', async () => {
        req.body = { password: 'password123' };
        await userController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'username, email and password are required' });
    });


    it('should return 404 if user not found', async () => {
      req.body = { username: 'unknownuser', password: 'password123' };
      db.users.findOne.mockResolvedValue(null);

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 401 if email provided does not match user\'s email', async () => {
        req.body = { username: 'loginuser', email: 'wrong@example.com', password: 'password123' };
        db.users.findOne.mockResolvedValue(loginUserDbData);

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if password does not match', async () => {
      req.body = { username: 'loginuser', password: 'wrongpassword123' };
      db.users.findOne.mockResolvedValue(loginUserDbData);
      bcrypt.compare.mockResolvedValue(false);

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 500 if db.users.findOne throws an error', async () => {
        req.body = { username: 'loginuser', password: 'password123' };
        const dbError = new Error('DB findOne error');
        db.users.findOne.mockRejectedValue(dbError);

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: `Error logging in user: ${dbError}` });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      db.users.find.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(db.users.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 404 if no users are found (empty array)', async () => {
      db.users.find.mockResolvedValue([]);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users found' });
    });

     it('should return 404 if db.users.find returns null', async () => {
      db.users.find.mockResolvedValue(null);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No users found' });
    });

    it('should return 500 if db.users.find throws an error', async () => {
      const dbError = new Error('DB find error');
      db.users.find.mockRejectedValue(dbError);

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: `Error fetching users: ${dbError}` });
    });
  });
});