const filter = require('leo-profanity');
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

// Создаем комментарии (только для авторизированных)
router.post('/', authMiddleware, async (req, res) => {
    

    try {
        const { content, newsId } = req.body; //достаем из тела запроса контент комментария и ID новости, к которой он относится

        // проверяем, что контент не пустой
        if (!content || content.trim().length === 0) {
                return res.status(400).json({ message: 'Комментарий не может быть пустым' });
        }

        // Фильтруем нецензурные слова
        const cleanContent = filter.clean(content);

        const newComment = new Comment({
            content: cleanContent,
            news: newsId,
            author: req.user.id // Берем ID пользователя из токена (middleware его туда записывает)
        });

        const savedComment = await newComment.save();

        // Сразу загружаем данные автора, чтобы вернуть фронтенду красивый ответ
        const populatedComment = await Comment.findById(savedComment._id).populate('author', 'username');

        res.status(201).json(populatedComment);
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ message: 'Ошибка при сохранении комментария' });
    }
});

// Получить комментарии для конкретной новости
router.get('/:newsId', async (req, res) => {
    try {
        const comments = await Comment.find({ news: req.params.newsId })
            .populate('author', 'username') // Подтягиваем имя автора из модели User
            .sort({ createdAt: -1 }); // Сначала новые
        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: 'Ошибка при получении комментариев' });
    }
});

module.exports = router;