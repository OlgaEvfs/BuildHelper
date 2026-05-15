const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Пожалуйста, введите ваше имя'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Пожалуйста, добавьте адрес электронной почты'],
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: [true, 'Пожалуйста, укажите тему обращения'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Опишите вашу проблему'],
        maxLength: 1000
    },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema);