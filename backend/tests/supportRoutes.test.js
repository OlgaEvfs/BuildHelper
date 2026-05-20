const request = require('supertest');
const express = require('express');
const supportRoutes = require('../routes/support');
const SupportRequest = require('../models/SupportRequest');
const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');

const app = express();
app.use(express.json());
app.use('/api/support', supportRoutes);

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Support Routes', () => {
  it('POST /api/support should create request', async () => {
    const res = await request(app)
      .post('/api/support')
      .send({ 
        name: 'Test', 
        email: 'test@example.com', 
        subject: 'Help', 
        message: 'Message' 
      });
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/support should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/support')
      .send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
  });
});
