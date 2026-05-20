const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/admin');
const User = require('../models/User');
const News = require('../models/News');
const Comment = require('../models/Comment');
const Calculation = require('../models/Calculation');
const Planner = require('../models/Planner');
const Checklist = require('../models/Checklist');
const SupportRequest = require('../models/SupportRequest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 'adminId', role: 'admin' };
  next();
});
jest.mock('../middleware/adminMiddleware', () => (req, res, next) => next());
jest.mock('../models/User');
jest.mock('../models/News');
jest.mock('../models/Comment');
jest.mock('../models/Calculation');
jest.mock('../models/Planner');
jest.mock('../models/Checklist');
jest.mock('../models/SupportRequest');

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

describe('Admin Routes - Complete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /api/admin/users/:id/reset-password should reset password', async () => {
    const mockUser = { id: 'user1', password: 'old', save: jest.fn().mockResolvedValue({}) };
    User.findById.mockResolvedValue(mockUser);
    
    const res = await request(app).put('/api/admin/users/user1/reset-password');
    expect(res.statusCode).toBe(200);
    expect(mockUser.resetPasswordRequired).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('DELETE /api/admin/users/:id should perform cascade delete', async () => {
    User.findById.mockResolvedValue({ id: 'user1', role: 'user' });
    
    const res = await request(app).delete('/api/admin/users/user1');
    expect(res.statusCode).toBe(200);
    expect(News.deleteMany).toHaveBeenCalled();
    expect(Comment.deleteMany).toHaveBeenCalled();
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('user1');
  });

  it('DELETE /api/admin/users/:id should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = await request(app).delete('/api/admin/users/notfound');
    expect(res.statusCode).toBe(404);
  });
});
