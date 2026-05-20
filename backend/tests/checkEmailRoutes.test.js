const request = require('supertest');
const express = require('express');
const checkEmailRoutes = require('../routes/checkEmail');
const User = require('../models/User');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../models/User');

const app = express();
app.use(express.json());
app.use('/api', checkEmailRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('CheckEmail Route', () => {
  it('POST /api/check-email should return exists: true if user found', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com' });
    const res = await request(app)
      .post('/api/check-email')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(true);
  });

  it('POST /api/check-email should return exists: false if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/check-email')
      .send({ email: 'new@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(false);
  });

  it('POST /api/check-email should return 500 on db error', async () => {
    User.findOne.mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .post('/api/check-email')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(500);
  });
});
