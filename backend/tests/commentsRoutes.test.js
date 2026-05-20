const request = require('supertest');
const express = require('express');
const commentRoutes = require('../routes/comments');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011', role: 'user' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/comments', commentRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Comments Routes', () => {
  it('POST /api/comments should create comment', async () => {
    Comment.prototype.save = jest.fn().mockResolvedValue({ _id: 'comment123' });
    Comment.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: 'comment123', content: 'Nice' })
    });

    const res = await request(app)
      .post('/api/comments')
      .send({ content: 'Nice', newsId: 'news123' });
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/comments should return 500 on db error', async () => {
    Comment.prototype.save = jest.fn().mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .post('/api/comments')
      .send({ content: 'Nice', newsId: 'news123' });
    expect(res.statusCode).toBe(500);
  });

  it('POST /api/comments should return 400 on bad words', async () => {
    const resEmpty = await request(app)
      .post('/api/comments')
      .send({ content: '', newsId: 'news123' });
    expect(resEmpty.statusCode).toBe(400);
  });

  it('GET /api/comments/:newsId should return comments', async () => {
    Comment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        })
    });
    const res = await request(app).get('/api/comments/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/comments/:newsId should return 500 on db error', async () => {
    Comment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('DB Error'))
        })
    });
    const res = await request(app).get('/api/comments/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(500);
  });
});
