const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Получить вакансии текущего пользователя (САМЫЙ ВАЖНЫЙ РОУТ)
// Он должен идти ПЕРЕД /:id, чтобы Express не спутал "my-jobs" с ID вакансии
router.get('/my-jobs', authMiddleware, async (req, res) => {
    try {
        const jobs = await News.find({ author: req.user.id, category: 'jobs' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error("Ошибка API My Jobs:", err);
        res.status(500).json({ message: 'Ошибка при получении вакансий' });
    }
});

// 2. Получить новости с пагинацией и фильтрацией
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

// 3. Получить одну новость по ID
router.get('/:id', async (req, res) => {
    try {
        const newsItem = await News.findById(req.params.id);
        if (!newsItem) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }
        res.json(newsItem);
    } catch (err) {
        console.error("Ошибка API News Detail:", err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Некорректный ID новости' });
        }
        res.status(500).json({ message: 'Ошибка сервера при получении новости' });
    }
});

// 4. Создать новую вакансию
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            title, content, category, imageUrl,
            jobType, location, employment, salary,
            contactName, contactEmail, contactPhone
        } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ message: 'Заполните обязательные поля' });
        }

        const vacancyImages = {
            finishing: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800',
            plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800',
            electrical: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800',
            masonry: 'https://images.unsplash.com/photo-1590059132718-5021f4bc1296?q=80&w=800',
            roofing: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=800',
            hvac: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800',
            general: 'https://images.unsplash.com/photo-1504307651254-35680f336dbd?q=80&w=800'
        };

        const finalImageUrl = imageUrl || (category === 'jobs' ? (vacancyImages[jobType] || vacancyImages.general) : imageUrl);

        const newPost = new News({
            author: req.user.id,
            title, content, category, imageUrl: finalImageUrl,
            jobType, location, employment, salary,
            contactName, contactEmail, contactPhone
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Удалить свою вакансию
router.delete('/:id', authMiddleware, async (req,res) => {
    try {
        const post = await News.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Вакансия не найдена' });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'Вакансия удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
});

module.exports = router;