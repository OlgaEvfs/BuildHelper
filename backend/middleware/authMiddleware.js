const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Проверяем, есть ли токен в заголовках
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Получаем токен из заголовка
            token = req.headers.authorization.split(' ')[1];

            // Проверяем токен и получаем ID пользователя
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Находим пользователя по ID и прикрепляем его к объекту запроса
            // Мы не хотим возвращать пароль, поэтому используем select('-password')
            req.user = await User.findById(decoded.id).select('-password');

            next(); // переходим к следующему middleware
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };