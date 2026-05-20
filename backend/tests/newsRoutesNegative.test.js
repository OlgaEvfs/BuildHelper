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

// Mock upload to force error
jest.mock('../middleware/uploadMiddleware', () => ({
  single: () => (req, res, next) => {
    if (req.headers['x-trigger-error']) {
      return next(new Error('Multer error'));
    }
    next();
  }
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

describe('News Routes - Negative', () => {
  beforeEach(async () => {
    await News.deleteMany({});
  });

  it('POST /api/news should return 400 on upload error', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('x-trigger-error', 'true')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Ошибка загрузки файла');
  });

  it('POST /api/news should return 400 for invalid job data', async () => {
    const res = await request(app)
      .post('/api/news')
      .send({ title: 'Job', content: 'C', category: 'jobs' }); // Missing job fields
    expect(res.statusCode).toBe(400);
  });
});
