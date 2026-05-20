const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');
const Comment = require('../models/Comment');
const SupportRequest = require('../models/SupportRequest');
const Planner = require('../models/Planner');

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Small Models', () => {
  it('should save Comment', async () => {
    const data = { 
        author: new mongoose.Types.ObjectId(), 
        news: new mongoose.Types.ObjectId(), 
        content: 'Test Comment' 
    };
    const doc = new Comment(data);
    const saved = await doc.save();
    expect(saved._id).toBeDefined();
  });

  it('should save SupportRequest', async () => {
    const data = { 
        name: 'Test User', 
        email: 'test@example.com', 
        subject: 'Help', 
        message: 'Help message' 
    };
    const doc = new SupportRequest(data);
    const saved = await doc.save();
    expect(saved._id).toBeDefined();
  });

  it('should save Planner', async () => {
    const data = { user: new mongoose.Types.ObjectId(), task: 'Task', date: new Date() };
    const doc = new Planner(data);
    const saved = await doc.save();
    expect(saved._id).toBeDefined();
  });
});
