const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { 
        type: String,
        required: true,
        trim: true // trim удаляет пробелы в начале и конце
    }, 
    content: { 
        type: String,
        required: true
    },
    imageUrl: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800'
    },
    category: {
        type: String,
        required: true,
        enum: ['tech', 'market', 'experts', 'calendar', 'jobs'],
        default: 'tech'
    },
    jobType: {
        type: String,
        enum: [
            'finishing', // Отделочные работы
            'plumbing', // Сантехника
            'electrical', // Электрика
            'masonry', // Каменные работы
            'roofing', // Кровельные работы
            'hvac', // Вентиляция и отопление
            'general', // Разнорабочие / Общие работы
            null
        ],
        default: null
    },
    location: {
        type: String,
        trim: true
    },
    employment: {
        type: String,
        enum: ['Полная занятость', 'Частичная занятость', 'Подряд', 'Временная работа', 'Стажировка', null],
        default: null
    },
    salary: {
        type: String,
        trim: true
    },
    contactName: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Если значение не введено, валидация проходит (проверка на обязательность в required)
                return /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            }
        }
    },
    contactPhone: {
        type: String,
        trim: true,
        required: function() {
            return this.category === 'jobs';
        },
        validate: {
            validator: function(v) {
                if (!v) return true; // Если значение не введено, валидация проходит (проверка на обязательность в required)
                return /^[\d\s+-]{5,20}$/.test(v);
            },
            message: 'Укажите корректный номер телефона (минимум 5 цифр)'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'published'],
        default: 'published' // Сейчас оставим 'published', чтобы ничего не пропало
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

// Добавляем индексы для ускорения работы
newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1 });

module.exports = mongoose.model('News', newsSchema);