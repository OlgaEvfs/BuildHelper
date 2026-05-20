const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const authController = require('../controllers/authController');

// Mock controllers
jest.mock('../controllers/authController', () => ({
  registerUser: (req, res) => res.status(201).json({ message: 'Registered' }),
  authUser: (req, res) => res.status(200).json({ token: 'mocktoken' }),
  updatePassword: (req, res) => res.status(200).json({ message: 'Updated' })
}));

// Mock middleware
jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  it('POST /api/auth/register should call registerUser', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(201);
  });

  it('POST /api/auth/login should call authUser', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/auth/profile should return user', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('507f1f17bcf86cd799439011');
  });

  it('PUT /api/auth/updatepassword should call updatePassword', async () => {
    const res = await request(app).put('/api/auth/updatepassword').send({});
    expect(res.statusCode).toBe(200);
  });
});
