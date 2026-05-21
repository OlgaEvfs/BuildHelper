const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Used for password hashing

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Пожалуйста, добавьте имя пользователя'],
        trim: true, // Trim whitespace at beginning and end
    },
    email: {
        type: String,
        required: [true, 'Пожалуйста, добавьте адрес электронной почты'],
        unique: true, // Ensure email uniqueness
        lowercase: true, // Save email in lowercase
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Пожалуйста, добавьте действительный адрес электронной почты'], // Validate email format
    },
    password: {
        type: String,
        required: [true, 'Пожалуйста, добавьте пароль'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },
    resetPasswordRequired: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now // Save creation date
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Proceed if password hasn't changed
    }
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
});

// Define method to compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Compare entered password with hashed one
};

module.exports = mongoose.model('User', userSchema); // Export model for application use