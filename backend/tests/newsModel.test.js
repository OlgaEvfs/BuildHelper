const mongoose = require('mongoose');
const { connectToMemoryDB, closeMemoryDB, clearDatabase } = require('./testUtils');
const News = require('../models/News');

beforeAll(async () => {
  await connectToMemoryDB();
});

afterAll(async () => {
  await closeMemoryDB();
});

beforeEach(async () => {
  await clearDatabase();
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
