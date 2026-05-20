const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');
const News = require('../models/News');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('News Routes - Advanced', () => {
  beforeEach(async () => {
    await News.deleteMany({});
  });

  it('GET /api/news with filters should work', async () => {
    const authorId = new mongoose.Types.ObjectId();
    await News.create([
      { title: 'Tech 1', content: 'C', category: 'tech', status: 'published', author: authorId },
      { title: 'Jobs 1', content: 'C', category: 'jobs', jobType: 'finishing', status: 'published', author: authorId, contactPhone: '1234567' }
    ]);

    const res = await request(app).get('/api/news?category=tech');
    expect(res.statusCode).toBe(200);
    expect(res.body.news.length).toBe(1);
    expect(res.body.news[0].title).toBe('Tech 1');
  });

  it('GET /api/news with pagination should work', async () => {
    const authorId = new mongoose.Types.ObjectId();
    await News.create([
      { title: 'N1', content: 'C', category: 'tech', status: 'published', author: authorId },
      { title: 'N2', content: 'C', category: 'tech', status: 'published', author: authorId }
    ]);

    const res = await request(app).get('/api/news?page=1&limit=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.news.length).toBe(1);
    expect(res.body.pagination.totalItems).toBe(2);
  });
});
