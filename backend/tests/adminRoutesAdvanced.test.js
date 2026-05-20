const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const User = require('../models/User');
const News = require('../models/News');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011', role: 'admin' };
  next();
});
jest.mock('../middleware/adminMiddleware', () => (req, res, next) => {
  next();
});
jest.mock('../models/User');
jest.mock('../models/News');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Admin Routes - Advanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /api/admin/users/:id/status should update user status', async () => {
    const mockUser = { _id: 'user1', role: 'user' };
    User.findById.mockResolvedValue(mockUser);
    User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user1', status: 'banned' })
    });

    const res = await request(app)
      .put('/api/admin/users/user1/status')
      .send({ status: 'banned' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Статус изменен');
  });

  it('DELETE /api/admin/users/:id should fail for admin', async () => {
    User.findById.mockResolvedValue({ role: 'admin' });
    const res = await request(app).delete('/api/admin/users/admin1');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Нельзя удалить администратора');
  });

  it('PUT /api/admin/content/:id/status should update news status', async () => {
    News.findByIdAndUpdate.mockResolvedValue({});
    const res = await request(app)
      .put('/api/admin/content/news1/status')
      .send({ status: 'published' });
    expect(res.statusCode).toBe(200);
  });
});
