const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Пожалуйста, добавьте адрес электронной почты'],
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: [true, 'Опишите вашу проблему'],
        maxLength: 1000
    },
    contactInfo: {
        type: String,
        required: [true, 'Укажите, как свами связаться (например, Telegram или Телефон)'],
        trim: true
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