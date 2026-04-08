const express = require('express');
const router = express.Router();
const News = require('../models/News');

//Получить новости с паггинацией и фильтрацией
router.get('/', async (req, res) => {
    try {
        // Параметры запроса (по умолчанию 1 страница, 10 новостей)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const jobType = req.query.jobType;

        // Фильтр для поиска в БД
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (jobType && jobType !== 'all') {
            query.jobType = jobType;
        }

        // Вычисляем, сколько новостей пропустить
        const skip = (page - 1) * limit;

        // Получаем общее количество подходящих новостей
        const totalItems = await News.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        // Запрос к БД с сортировкой по дате (сначала новые)
        const news = await News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        // Формируем ответ
        res.json({news, pagination: { totalItems, totalPages, currentPage: page, limit } });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при получении новостей' });
    }
});

module.exports = router;