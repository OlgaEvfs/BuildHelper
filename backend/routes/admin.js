const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const Comment = require('../models/Comment');
const Calculation = require('../models/Calculation');
const Planner = require('../models/Planner');
const Checklist = require('../models/Checklist');
const SupportRequest = require('../models/SupportRequest');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(protect); // Все роуты ниже требуют аутентификации
router.use(admin); // Все роуты ниже требуют прав администратора

// -------- ОБЩАЯ СТАТИСТИКА (DASHBOARD) --------

// @desc Получить статистику для дашборда
router.get('/stats', async (req, res) => {
    try {
        const [userCount, newsCount, supportCount] = await Promise.all([
            User.countDocuments(),
            News.countDocuments(),
            SupportRequest.countDocuments()
        ]);
        res.json({
            users: userCount,
            news: newsCount,
            support: supportCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении статистики' });
    }
});

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
        const userId = req.params.id;

        // Сначала проверим, не админ ли это
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Нельзя забанить администратора' });

        // Используем findByIdAndUpdate вместо .save(), чтобы избежать проблем с валидацией других полей
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { status: status },
            { returnDocument: 'after', runValidators: true }
        ).select('-password');

        res.json({ message: `Статус изменен на ${status}`, user: updatedUser });
    } catch (err) {
        console.error('Ошибка при смене статуса:', err);
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
            Checklist.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        res.json({ message: 'Пользователь и все его данные полностью удалены из системы' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при каскадном удалении' });
    }
});

// -------- УПРАВЛЕНИЕ КОНТЕНТОМ (НОВОСТИ И ВАКАНСИИ) --------

// @desc Получить все новости и вакансии
router.get('/content', async (req, res) => {
    try {
        const content = await News.find({})
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении контента' });
    }
});

// @desc Изменить статус публикации (Одобрить/Снять)
router.put('/content/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'published'].includes(status)) {
            return res.status(400).json({ message: 'Некорректный статус' });
        }
        await News.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: `Запись ${status === 'published' ? 'опубликована' : 'отправлена на модерацию'}` });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статуса' });
    }
});

// @desc Удалить запись (новость или вакансию)
router.delete('/content/:id', async (req, res) => {
    console.log(`--- Запрос на удаление контента: ${req.params.id} ---`);
    try {
        const item = await News.findById(req.params.id);
        if (!item) {
            console.log('Ошибка: Запись не найдена в БД');
            return res.status(404).json({ message: 'Запись не найдена' });
        }

        console.log(`Удаление записи "${item.title}" и комментариев к ней...`);
        // Удаляем саму запись и все комментарии к ней
        const result = await Promise.all([
            News.findByIdAndDelete(req.params.id),
            Comment.deleteMany({ news: req.params.id })
        ]);
        
        console.log('Запись успешно удалена:', result);
        res.json({ message: 'Запись успешно удалена' });
    } catch (err) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА ПРИ УДАЛЕНИИ КОНТЕНТА:', err);
        res.status(500).json({ message: 'Ошибка сервера при удалении записи: ' + err.message });
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

// @desc    Изменить статус заявки (open/resolved)
router.put('/support/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['open', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Некорректный статус' });
        }
        const request = await SupportRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!request) return res.status(404).json({ message: 'Заявка не найдена' });
        res.json({ message: 'Статус обновлен', request });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статуса' });
    }
});

module.exports = router;