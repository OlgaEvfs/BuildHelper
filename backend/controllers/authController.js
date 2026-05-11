// Регистрация и аутентификация пользователей
const User = require('../models/User');
const generateToken = require('../config/utils');

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Простая проверка на наличие данных
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Пожалуйста заполните все поля' });
    }

    // Проверка длины пароля
    if (password.length < 6) {
        return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }

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

    // Простая проверка на наличие данных
    if (!email || !password) {
        return res.status(400).json({ message: 'Пожалуйста заполните все поля' });
    }

    try {
        // Находим пользователя по email
        const user = await User.findOne({ email });

        // Если нашли, проверяем совпадает ли пароль
        // (мы используем метод matchPassword, который добавили в модель User.js ранее)
        if (user && (await user.matchPassword(password))) {

            if (user.status === 'banned') {
                return res.status(403).json({ message: 'Доступ запрещен. Ваш аккаунт заблокирован' });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                resetPasswordRequired: user.resetPasswordRequired,
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

// @desc Смена пароля
// @route PUT /api/auth/updatepassword
// @access  Private (только для авторизованных)
const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Проверяем, прислал ли пользователь данные
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    try {
        // Находим пользователя в базе
        // req.user._id берется из middleware protect, который мы добавим в роуты
        const user = await User.findById(req.user._id);

        // Проверяем, совпадает ли старый пароль с тем, что в базе
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный текущий пароль' });
        }

        // Если ок, записываем новый пароль
        user.password = newPassword;
        user.resetPasswordRequired = false;
        
        await user.save();

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при смене пароля' });
    }
};

module.exports = { registerUser, authUser, updatePassword }; // Экспортируем функции для использования в маршрутах