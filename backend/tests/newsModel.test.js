const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const News = require('../models/News');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('News Model', () => {
  it('should create & save news successfully', async () => {
    const newsData = {
      title: 'Test News',
      content: 'Content',
      category: 'tech',
      author: new mongoose.Types.ObjectId(),
      status: 'published'
    };
    const news = new News(newsData);
    const saved = await news.save();
    expect(saved._id).toBeDefined();
    expect(saved.title).toBe(newsData.title);
  });
});
