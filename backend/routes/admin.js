const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const Comment = require('../models/Comment');
const Calculation = require('../models/Calculation');
const Planner = require('../models/Planner');
const SupportRequest = require('../models/SupportRequest');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(protect); // Все роуты ниже требуют аутентификации
router.use(admin); // Все роуты ниже требуют прав администратора

// -------- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ --------

// @desc Получить список всех пользователей
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при получении списка пользователей' });
    }
});

// @desc Изменить статус (Бан/Разбан)
router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Нельзя забанить администратора' });

        user.status = status;
        await user.save();
        res.json({ message: `Статус изменен на ${status}`, user });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при смене статуса' });
    }
});

// @desc    СБРОС ПАРОЛЯ И ФЛАГ ПРИНУДИТЕЛЬНОЙ СМЕНЫ
router.put('/users/:id/reset-password', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        const tempPassword = Math.random().toString(36).slice(-8);
        user.password = tempPassword;
        user.resetPasswordRequired = true; // Ставим метку для фронтенда
        await user.save();

        res.json({ message: 'Пароль сброшен', tempPassword });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сбросе пароля' });
    }
});

 // @desc    КАСКАДНОЕ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Нельзя удалить администратора' });

        // Чистим базу данных полностью
        await Promise.all([
            News.deleteMany({ author: userId }),
            Comment.deleteMany({ author: userId }),
            Calculation.deleteMany({ user: userId }),
            Planner.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({ message: 'Пользователь и все его данные полностью удалены из системы' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при каскадном удалении' });
    }
});

// --- УПРАВЛЕНИЕ ПОДДЕРЖКОЙ ---
// @desc    Просмотр всех заявок
router.get('/support', async (req, res) => {
    try {
        const requests = await SupportRequest.find({}).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении заявок' });
    }
});

// @desc    Удалить заявку (после решения проблемы)
router.delete('/support/:id', async (req, res) => {
    try {
        await SupportRequest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Заявка удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении заявки' });
    }
});

module.exports = router;