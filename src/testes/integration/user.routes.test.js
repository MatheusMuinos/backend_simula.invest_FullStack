import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../models/index.js', () => ({
  __esModule: true,
  default: {
    sequelize: {
      sync: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    },
  },
}));

import server from '../../index.js';

let db;

const SERVER_URL = 'http://localhost:3000';

describe('User Routes', () => { 
  beforeAll(async () => {
    db = jest.requireActual('../../models/index.js').default;
    
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
    await db.sequelize.close();
  });

  describe('POST /register', () => {
    it('should register a new user successfully with valid data', async () => {
      const response = await request(SERVER_URL)
        .post('/register')
        .send({
          username: 'janedoe',
          email: 'jane.doe@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User registered successfully' });

      const userInDb = await db.users.findOne({ where: { email: 'jane.doe@example.com' } });
      expect(userInDb).not.toBeNull();
      const isPasswordCorrect = await bcrypt.compare('Password123!', userInDb.password);
      expect(isPasswordCorrect).toBe(true);
    });

    it('should fail to register if the email already exists', async () => {
      await db.users.create({
          username: 'existing_user_1',
          email: 'duplicate.email@example.com',
          password: 'somepassword'
      });
      
      const response = await request(SERVER_URL)
        .post('/register')
        .send({
          username: 'another_user',
          email: 'duplicate.email@example.com',
          password: 'Password123!',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });
    
    it('should fail to register if the username already exists', async () => {
        await db.users.create({
            username: 'duplicate_username',
            email: 'unique.email@example.com',
            password: 'somepassword'
        });

        const response = await request(SERVER_URL)
            .post('/register')
            .send({
                username: 'duplicate_username',
                email: 'another.unique.email@example.com',
                password: 'Password123!'
            });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username or email already exists');
    });

    it('should fail to register if the password field is missing', async () => {
      const response = await request(SERVER_URL)
        .post('/register')
        .send({
          username: 'incomplete_user',
          email: 'incomplete@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('username, email and password are required');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('password-for-login', 10);
      await db.users.create({
        username: 'login_user',
        email: 'login@example.com',
        password: hashedPassword,
      });
    });

    it('should log in an existing user and return a JWT token', async () => {
      const response = await request(SERVER_URL)
        .post('/login')
        .send({
          username: 'login_user',
          password: 'password-for-login',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();

      const userInDb = await db.users.findOne({ where: { username: 'login_user' } });
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decodedToken.id).toBe(userInDb.id);
    });

    it('should fail to log in with an incorrect password', async () => {
      const response = await request(SERVER_URL)
        .post('/login')
        .send({
          username: 'login_user',
          password: 'wrong-password',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to log in if the user does not exist', async () => {
      const response = await request(SERVER_URL)
        .post('/login')
        .send({
          username: 'non_existent_user',
          password: 'any_password',
        });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
});
