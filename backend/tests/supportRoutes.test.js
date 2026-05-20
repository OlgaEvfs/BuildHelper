const request = require('supertest');
const express = require('express');
const supportRoutes = require('../routes/support');
const SupportRequest = require('../models/SupportRequest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(express.json());
app.use('/api/support', supportRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
