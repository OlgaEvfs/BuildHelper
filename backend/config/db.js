const mongoose = require('mongoose'); // Подлючаем библиотеку для MongoDB

const connectDB = async (dbUri = process.env.MONGODB_URI) => {
    try {
        await mongoose.connect(dbUri);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Останавливаем сервер при ошибке подключения
    }
};

module.exports = connectDB; // Экспортируем функцию для использования в server.js