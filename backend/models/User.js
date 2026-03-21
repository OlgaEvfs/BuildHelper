const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // для хеширования паролей

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

// Хешируем пароль перед сохранением
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next(); // если пароль не изменился, переходим к следующему middleware
    }
    const salt = await bcrypt.genSalt(10); // генерируем соль
    this.password = await bcrypt.hash(this.password, salt); // хешируем пароль
});

// Метод для сравнения паролей при входе
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // сравниваем введенный пароль с хешированным
};

module.exports = mongoose.model('User', userSchema); // Экспортируем модель для использования в других местах приложения