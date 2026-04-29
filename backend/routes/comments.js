const filter = require('leo-profanity');
filter.loadDictionary('en');
const russianList = require('leo-profanity/lib/dictionary/ru.json');
filter.add(russianList);
// filter.add(['слово1', 'слово2']); Если отдельные слова

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
        if (filter.check(content)) {
            return res.status(400).json({
                message: 'Ваш комментарий содержит недопустимые слова и не может быть опубликован.'
            });
        }

        // Если проверк прошла
        const newComment = new Comment({
            content: content,
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

// Удалить комментарий (только автор или админ)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
        }

        // Проверка прав: автор комментария или админ
        const isAuthor = comment.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Нет прав для удаления этого комментария'});
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Комментарий удален' });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ message: 'Ошибка при удалении комментария' });
    }
});

module.exports = router;