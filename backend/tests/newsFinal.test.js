const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');
const News = require('../models/News');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

// Mock middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user1', role: 'user' };
  next();
});
jest.mock('../middleware/uploadMiddleware', () => ({
  single: () => (req, res, next) => next()
}));
jest.mock('../models/News');

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

describe('News Routes - Final Push', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/news/:id should return 404 if not found', async () => {
    News.findById.mockResolvedValue(null);
    const res = await request(app).delete('/api/news/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/news/:id should return 500 on db error', async () => {
    News.findById.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).delete('/api/news/news1');
    expect(res.statusCode).toBe(500);
  });

  it('GET /api/news/:id should return 500 on db error', async () => {
    News.findById.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).get('/api/news/news1');
    expect(res.statusCode).toBe(500);
  });
});
