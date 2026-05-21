const request = require('supertest');
const express = require('express');
const calcRoutes = require('../routes/calculations');
const Calculation = require('../models/Calculation');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  // Use a fixed valid ObjectId string
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/calculations', calcRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Calculation Routes', () => {
  it('POST /api/calculations should create calc', async () => {
    const res = await request(app)
      .post('/api/calculations')
      .send({ type: 'tiles', result: '100' });
    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('tiles');
  });

  it('GET /api/calculations should return user calcs', async () => {
    const res = await request(app).get('/api/calculations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
