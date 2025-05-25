import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { createUser, findUserByUsername, findUserByEmail } from '../../services/user.service.js';

jest.mock('@models/index.js', () => ({
  __esModule: true,
  default: {
    users: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

import db from '@models/index.js';
import bcrypt from 'bcrypt';

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };
    const salt = 'somesalt';
    const hashedPassword = 'hashedPassword123';
    const createdUser = {
      id: 1,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    };

    it('should create a user successfully', async () => {
      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      db.users.create.mockResolvedValue(createdUser);

      const result = await createUser(userData);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, salt);
      expect(db.users.create).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if bcrypt.genSalt fails', async () => {
      const saltError = new Error('Salt generation failed');
      bcrypt.genSalt.mockRejectedValue(saltError);

      await expect(createUser(userData)).rejects.toThrow(saltError);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(db.users.create).not.toHaveBeenCalled();
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const hashError = new Error('Hashing failed');
      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockRejectedValue(hashError);

      await expect(createUser(userData)).rejects.toThrow(hashError);
      expect(db.users.create).not.toHaveBeenCalled();
    });

    it('should throw an error if db.users.create fails', async () => {
      const dbError = new Error('Database creation failed');
      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      db.users.create.mockRejectedValue(dbError);

      await expect(createUser(userData)).rejects.toThrow(dbError);
    });
  });

  describe('findUserByUsername', () => {
    const username = 'testuser';
    const mockUser = { id: 1, username, email: 'test@example.com' };

    it('should find and return a user by username', async () => {
      db.users.findOne.mockResolvedValue(mockUser);

      const result = await findUserByUsername(username);

      expect(db.users.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found by username', async () => {
      db.users.findOne.mockResolvedValue(null);

      const result = await findUserByUsername(username);

      expect(db.users.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(result).toBeNull();
    });

    it('should throw an error if db.users.findOne fails', async () => {
      const dbError = new Error('Database find failed');
      db.users.findOne.mockRejectedValue(dbError);

      await expect(findUserByUsername(username)).rejects.toThrow(dbError);
    });
  });

  describe('findUserByEmail', () => {
    const email = 'test@example.com';
    const mockUser = { id: 1, username: 'testuser', email };

    it('should find and return a user by email', async () => {
      db.users.findOne.mockResolvedValue(mockUser);

      const result = await findUserByEmail(email);

      expect(db.users.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found by email', async () => {
      db.users.findOne.mockResolvedValue(null);

      const result = await findUserByEmail(email);

      expect(db.users.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });

    it('should throw an error if db.users.findOne fails', async () => {
      const dbError = new Error('Database find failed');
      db.users.findOne.mockRejectedValue(dbError);

      await expect(findUserByEmail(email)).rejects.toThrow(dbError);
    });
  });
});