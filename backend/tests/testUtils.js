const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const News = require('../models/News');
const User = require('../models/User');

let mongoServer;

// Function to connect to in-memory database
const connectToMemoryDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    return uri;
};

// Function to disconnect and clean up
const closeMemoryDB = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};

// Function to clear data between tests
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
};

// Function to seed the database
const seedDatabase = async () => {
    // Create temporary admin
    const admin = new User({
        username: 'testadmin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
    });
    
    await admin.save();

    const newsData = [
        {
            title: "3D-печать домов: Экономия 40%",
            content: "Технология возведения зданий...",
            category: "tech",
            author: admin._id
        },
        {
            title: "Вакансия: Мастер отделочных работ",
            content: "В связи с расширением...",
            category: "jobs",
            jobType: "finishing",
            location: "Таллинн",
            contactPhone: "+372 5555 5555",
            author: admin._id
        }
    ];

    await News.insertMany(newsData);
};

module.exports = {
    connectToMemoryDB,
    closeMemoryDB,
    clearDatabase,
    seedDatabase
};
