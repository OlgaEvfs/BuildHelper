const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const News = require('../models/News');
const User = require('../models/User');

let mongoServer;

// Функция для подключения к in-memory базе
const connectToMemoryDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    return uri;
};

// Функция для отключения и очистки
const closeMemoryDB = async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
};

// Функция для очистки данных между тестами
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
};

// Функция для заполнения базы данных
const seedDatabase = async () => {
    // Создаем временного админа
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
