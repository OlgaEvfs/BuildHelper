const request = require('supertest');
const express = require('express');
const checklistRoutes = require('../routes/checklist');
const Checklist = require('../models/Checklist');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});
jest.mock('../models/Checklist');

const app = express();
app.use(express.json());
app.use('/api/checklist', checklistRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Checklist Routes - Negative', () => {
  it('GET /api/checklist should return 500 on db error', async () => {
    Checklist.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
    });
    const res = await request(app).get('/api/checklist');
    expect(res.statusCode).toBe(500);
  });

  it('PATCH /api/checklist/:id should return 404 if task not found', async () => {
    Checklist.findById.mockResolvedValue(null);
    const res = await request(app).patch('/api/checklist/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/checklist/:id should return 403 if unauthorized', async () => {
    const task = { user: new mongoose.Types.ObjectId() };
    Checklist.findById.mockResolvedValue(task);
    const res = await request(app).patch('/api/checklist/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(403);
  });

  it('PATCH /api/checklist/:id should return 500 on db error', async () => {
    Checklist.findById.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).patch('/api/checklist/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(500);
  });

  it('DELETE /api/checklist/:id should return 404 if task not found', async () => {
    Checklist.findById.mockResolvedValue(null);
    const res = await request(app).delete('/api/checklist/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/checklist/:id should return 500 on db error', async () => {
    Checklist.findById.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).delete('/api/checklist/507f1f17bcf86cd799439011');
    expect(res.statusCode).toBe(500);
  });
});
