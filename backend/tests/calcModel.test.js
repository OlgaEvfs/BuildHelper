const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Calculation = require('../models/Calculation');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
