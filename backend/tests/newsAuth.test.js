const request = require('supertest');
const express = require('express');
const newsRoutes = require('../routes/news');
const News = require('../models/News');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'user1', role: 'user' }; // Default user
  next();
});
jest.mock('../middleware/uploadMiddleware', () => ({
  single: () => (req, res, next) => next()
}));
jest.mock('../models/News');

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

describe('News Routes - PUT/DELETE Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/news/:id should return 403 if not author or admin', async () => {
    News.findById.mockResolvedValue({ _id: 'news1', author: 'otherUser' });
    
    const res = await request(app).delete('/api/news/news1');
    expect(res.statusCode).toBe(403);
  });

  it('PUT /api/news/:id should return 403 if not author or admin', async () => {
    News.findById.mockResolvedValue({ _id: 'news1', author: 'otherUser' });
    
    const res = await request(app).put('/api/news/news1').send({ title: 'New' });
    expect(res.statusCode).toBe(403);
  });
});
