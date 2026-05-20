const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const User = require('../models/User');
const News = require('../models/News');
const SupportRequest = require('../models/SupportRequest');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase, seedDatabase } = require('./testUtils');

// ... (jest.mock calls)
// Reconstructing the block I need to update.

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011', role: 'admin' };
  next();
});
jest.mock('../middleware/adminMiddleware', () => (req, res, next) => {
  next();
});
jest.mock('../models/User');
jest.mock('../models/News');
jest.mock('../models/SupportRequest');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

describe('Admin Routes - Negative Scenarios', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();
    await seedDatabase();
  });

  it('PUT /api/admin/users/:id/status should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/admin/users/notfound/status')
      .send({ status: 'banned' });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/admin/content/:id/status should return 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/admin/content/news1/status')
      .send({ status: 'invalid' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/admin/support should return 500 on db error', async () => {
    SupportRequest.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
    });

    const res = await request(app).get('/api/admin/support');
    expect(res.statusCode).toBe(500);
  });
});
