// Регистрация и аутентификация пользователей
const User = require('../models/User');
const generateToken = require('../config/utils');

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Проверяем, есть ли уже пользователь с таким email
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Создаем нового пользователя (пароль будет автоматически хеширован благодаря middleware в модели)
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            // Если пользователь успешно создан, возвращаем его данные и токен
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Генерируем JWT токен
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Находим пользователя по email
        const user = await User.findOne({ email });

        // Если нашли, проверяем совпадает ли пароль
   11   // (мы используем метод matchPassword, который добавили в модель User.js ранее)
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Генерируем JWT токен
            });
        } else {
            // Если пользователь не найден или пароль не совпадает, возвращаем ошибку
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser }; // Экспортируем функции для использования в маршрутах