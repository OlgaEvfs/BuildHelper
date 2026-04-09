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

module.exports = router;