const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
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
        enum: ['finishing', 'plumbing', 'electrical', 'general', null],
        default: null
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