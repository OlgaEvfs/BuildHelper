const mongoose = require('mongoose');

const plannerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    rooms: {
        type: Array,
        default: []
    },
    furniture: {
        type: Array,
        default: []
    },
    openings: {
        type: Array,
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Planner', plannerSchema);