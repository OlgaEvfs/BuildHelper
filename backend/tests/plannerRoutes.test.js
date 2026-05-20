const request = require('supertest');
const express = require('express');
const plannerRoutes = require('../routes/planner');
const Planner = require('../models/Planner');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/planner', plannerRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Planner Routes', () => {
  it('GET /api/planner should return plan', async () => {
    const res = await request(app).get('/api/planner');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rooms');
  });

  it('POST /api/planner should save plan', async () => {
    const res = await request(app)
      .post('/api/planner')
      .send({ rooms: [], furniture: [], openings: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('План успешно сохранен');
  });
});
