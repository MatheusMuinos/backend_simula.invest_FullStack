// src/testes/setupTests.js
import { jest } from '@jest/globals';
import db from '../models/index.js';

beforeAll(async () => {
  jest.clearAllMocks();
  
  // Ensure proper sync order by using sequelize.sync with alter:true
  try {
    await db.sequelize.sync({ force: true });
  } catch (error) {
    console.error('Database sync failed:', error);
    throw error; // Fail tests if sync fails
  }
});

afterAll(async () => {
  try {
    await db.sequelize.close();
  } catch (error) {
    console.error('Failed to close connection:', error);
  }
});