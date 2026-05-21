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
        trim: true // Trim whitespace at beginning and end
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
            'finishing', // Finishing works
            'plumbing', // Plumbing
            'electrical', // Electrical
            'masonry', // Masonry
            'roofing', // Roofing
            'hvac', // HVAC/Heating
            'general', // General work
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
                if (!v) return true; // Validate if value exists
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
                if (!v) return true; // Validate if value exists
                return /^[\d\s+-]{5,20}$/.test(v);
            },
            message: 'Укажите корректный номер телефона (минимум 5 цифр)'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'published'],
        default: 'published'
    },
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

// Add indices for performance
newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1 });

module.exports = mongoose.model('News', newsSchema);