const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');
const Calculation = require('../models/Calculation');

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Calculation Model', () => {
  it('should create & save calculation successfully', async () => {
    const calcData = {
      user: new mongoose.Types.ObjectId(),
      type: 'tiles',
      result: '100'
    };
    const calc = new Calculation(calcData);
    const saved = await calc.save();
    expect(saved._id).toBeDefined();
    expect(saved.type).toBe(calcData.type);
  });
});
