const request = require('supertest');
const express = require('express');
const calcRoutes = require('../routes/calculations');
const Calculation = require('../models/Calculation');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});
jest.mock('../models/Calculation');

const app = express();
app.use(express.json());
app.use('/api/calculations', calcRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

describe('Calculation Routes - Negative', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();
  });

  it('POST /api/calculations should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/calculations')
      .send({ type: 'tiles' }); // Missing result
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /api/calculations/:id should return 404 if not found', async () => {
    Calculation.findById.mockResolvedValue(null);
    const res = await request(app).delete('/api/calculations/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/calculations/:id should return 403 if unauthorized', async () => {
    Calculation.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId() });
    const res = await request(app).delete('/api/calculations/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(403);
  });
});
