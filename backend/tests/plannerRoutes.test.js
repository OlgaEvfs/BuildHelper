const request = require('supertest');
const express = require('express');
const plannerRoutes = require('../routes/planner');
const Planner = require('../models/Planner');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/planner', plannerRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
