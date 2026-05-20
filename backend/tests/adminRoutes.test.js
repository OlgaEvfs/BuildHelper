const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const User = require('../models/User');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock middlewares
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011', role: 'admin' };
  next();
});
jest.mock('../middleware/adminMiddleware', () => (req, res, next) => {
  next();
});

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

describe('Admin Routes', () => {
  it('GET /api/admin/stats should return stats', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
  });

  it('GET /api/admin/users should return users', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
