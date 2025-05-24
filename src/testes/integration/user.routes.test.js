import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../index.js';
import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Routes', () => {
  beforeAll(async () => {
    // Limpa e recria as tabelas antes dos testes
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');

      // Verifica se o usuário foi criado no banco de dados
      const user = await db.users.findOne({ where: { username: 'testuser' } });
      expect(user).not.toBeNull();
      expect(user.email).toBe('test@example.com');
    });

    it('should return 400 if username or email already exists', async () => {
      // Cria um usuário primeiro
      await db.users.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'hashedpassword',
      });

      const response = await request(app)
        .post('/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          // Campos obrigatórios faltando
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('username, email and password are required');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      // Cria um usuário para teste de login
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.users.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: hashedPassword,
      });
    });

    it('should login a user and return token', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();

      // Verifica se o token é válido
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 401 if password is invalid', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});