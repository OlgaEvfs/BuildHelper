const request = require('supertest');
const express = require('express');
const checklistRoutes = require('../routes/checklist');
const Checklist = require('../models/Checklist');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/checklist', checklistRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Checklist Routes', () => {
  it('POST /api/checklist should create task', async () => {
    const res = await request(app)
      .post('/api/checklist')
      .send({ text: 'Test Task' });
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Test Task');
  });

  it('GET /api/checklist should return user tasks', async () => {
    const res = await request(app).get('/api/checklist');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
