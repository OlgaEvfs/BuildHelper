const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const User = require('../models/User');
const News = require('../models/News');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase, seedDatabase } = require('./testUtils');

// ... (jest.mock calls)
// Wait, I need the full content to replace correctly without omitting anything.
// I have the content from the previous read_file.
// I will reconstruct the full block.
// Actually, I can just use a smaller context.
// Let's re-read the instruction for 'replace': "The exact literal text to replace, preferably unescaped. For single replacements (default), include at least 3 lines of context BEFORE and AFTER the target text..."

// Let's use smaller context replacements.
// 1. Update import.
// 2. Update beforeEach.


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

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

describe('Admin Routes - Advanced', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();
    await seedDatabase();
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
