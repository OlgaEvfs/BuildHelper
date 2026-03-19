const mongoose = require('mongoose');

// Схема пользователя
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        trim: true, // удаляет пробелы в начале и конце
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // почта не должна повторятся
        lowercase: true, // сохранять в нижнем регистре
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'], // проверка формата почты
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now // сохраняем дату создания
    }
});

module.exports = mongoose.model('User', userSchema); // Экспортируем модель для использования в других местах приложения