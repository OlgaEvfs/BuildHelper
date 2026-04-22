const express = require('express');
const router = express.Router();
const News = require('../models/News');

//Получить новости с паггинацией и фильтрацией
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const jobType = req.query.jobType;

        let query = {};
        if (category && category !== 'all') query.category = category;
        if (jobType && jobType !== 'all') query.jobType = jobType;

        const skip = (page - 1) * limit;

        const [totalItems, news] = await Promise.all([
            News.countDocuments(query),
            News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

        const totalPages = Math.ceil(totalItems / limit);
        res.json({news, pagination: { totalItems, totalPages, currentPage: page, limit } });
    } catch (err) {
        console.error("Ошибка API News:", err);
        res.status(500).json({ message: 'Ошибка сервера при получении новостей' });
    }
});

// Получить одну новость по ID
router.get('/:id', async (req, res) => {
    try {
        const newsItem = await News.findById(req.params.id);
        if (!newsItem) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }
        res.json(newsItem);
    } catch (err) {
        console.error("Ошибка API News Detail:", err);
        // Если ID передан в неправильном формате (не 24 символа MongoDB)
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Некорректный ID новости' });
        }
        res.status(500).json({ message: 'Ошибка сервера при получении новости' });
    }
});

module.exports = router;