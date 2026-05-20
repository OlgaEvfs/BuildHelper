const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');
const News = require('../models/News');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

// Mock middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user123', role: 'user' };
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

describe('News Routes', () => {
  it('GET /api/news should return 200', async () => {
    const res = await request(app).get('/api/news');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('news');
  });

  it('POST /api/news should create news', async () => {
    const newsData = {
      title: 'New Post',
      content: 'Content',
      category: 'tech'
    };
    const res = await request(app).post('/api/news').send(newsData);
    // User is not admin, so this should fail because category is not jobs
    expect(res.statusCode).toBe(403);
  });
});
