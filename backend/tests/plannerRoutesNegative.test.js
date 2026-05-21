const request = require('supertest');
const express = require('express');
const plannerRoutes = require('../routes/planner');
const Planner = require('../models/Planner');
const mongoose = require('mongoose');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: '507f1f17bcf86cd799439011' };
  next();
});
jest.mock('../models/Planner');

const app = express();
app.use(express.json());
app.use('/api/planner', plannerRoutes);

describe('Planner Routes - Negative', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/planner should return 500 on db error', async () => {
    Planner.findOne.mockRejectedValue(new Error('DB Error'));
    const res = await request(app).get('/api/planner');
    expect(res.statusCode).toBe(500);
  });

  it('POST /api/planner should create new plan if none exists', async () => {
    Planner.findOne.mockResolvedValue(null);
    Planner.prototype.save = jest.fn().mockResolvedValue({});
    
    const res = await request(app)
      .post('/api/planner')
      .send({ rooms: [], furniture: [], openings: [] });
    
    expect(res.statusCode).toBe(200);
    expect(Planner).toHaveBeenCalled(); // Constructor was called
  });

  it('POST /api/planner should return 500 on db error', async () => {
    Planner.findOne.mockRejectedValue(new Error('DB Error'));
    const res = await request(app)
      .post('/api/planner')
      .send({ rooms: [], furniture: [], openings: [] });
    expect(res.statusCode).toBe(500);
  });
});
