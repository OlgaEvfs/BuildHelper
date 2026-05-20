const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');
const News = require('../models/News');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

// Mock middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011', role: 'user' };
  next();
});
jest.mock('../middleware/uploadMiddleware', () => ({
  single: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/news', newsRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('News Routes - Detailed', () => {
  beforeEach(async () => {
    await News.deleteMany({});
  });

  it('POST /api/news should return 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/api/news')
      .send({ title: 'Missing content and category' });
    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/news/:id should return 404 if post not found', async () => {
    const res = await request(app)
      .put('/api/news/507f1f17bcf86cd799439011')
      .send({ title: 'New title' });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/news/:id should return 404 if post not found', async () => {
    const res = await request(app)
      .delete('/api/news/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });
});
