const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const News = require('../models/News');
const User = require('../models/User');

let mongoServer;

// Function to connect to in-memory database
const connectToMemoryDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not set in global setup");
        }
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri);
        }
        return uri;
    } catch (err) {
        console.error("Database connection error:", err);
        throw err;
    }
};

// Function to disconnect and clean up
const closeMemoryDB = async () => {
    try {
        // We don't stop the server here anymore, it's handled globally
        await mongoose.disconnect();
    } catch (err) {
        console.error("Database disconnect error:", err);
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
