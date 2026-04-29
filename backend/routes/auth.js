const express = require('express');
const router = express.Router();
// Добавляем authUser в импорт
const { registerUser, authUser, updatePassword } = require('../controllers/authController'); // Импортируем функцию для регистрации из контроллера
const protect = require('../middleware/authMiddleware'); // Импортируем middleware для защиты маршрутов

// Маршрут для регистрации
router.post('/register', registerUser);

// Маршрут для входа
router.post('/login', authUser);

// Пример защищенного маршрута, который требует авторизации
router.get('/profile', protect, (req, res) => {
    res.json(req.user); // Возвращаем данные пользователя, которого нашел "охранник"
});

// маршрут для смены пароля
// Используем .put, так как это обновление данных
// protect — это ваш middleware, который проверяет токен
router.put('/updatepassword', protect, updatePassword);

module.exports = router; // Экспортируем роутер для использования в server.js