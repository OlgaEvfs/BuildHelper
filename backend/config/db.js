const mongoose = require('mongoose'); // Подлючаем библиотеку для MongoDB

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Останавливаем сервер при ошибке подключения
    }
};

module.exports = connectDB; // Экспортируем функцию для использования в server.js