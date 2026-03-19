const express = require('express');
const router = express.Router();

// Маршрут для регистрации (пока просто заглушка)
router.post('/register', (req, res) => {
    res.json({ message: 'This is the registration endpoint' });
});

// Маршрут для входа
router.post('/login', (req, res) => {
    res.json({ message: 'This is the login endpoint' });
});

module.exports = router; // Экспортируем роутер для использования в server.js