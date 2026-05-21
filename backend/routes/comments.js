const filter = require('leo-profanity');
const { words: russianBadWords } = require('russian-bad-words');

filter.loadDictionary('en');
// Extract all word forms from russian-bad-words and add to filter
const russianList = russianBadWords.flatMap(obj => {
    const { type, ...rest } = obj;
    return Object.values(rest);
});
filter.add(russianList);
// filter.add(['word1', 'word2']); for individual words

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

// Create comments (authorized only)
router.post('/', authMiddleware, async (req, res) => {
    
    try {
        const { content, newsId } = req.body; // Extract comment content and news ID from request body

        // Check if content is empty
        if (!content || content.trim().length === 0) {
                return res.status(400).json({ message: 'Комментарий не может быть пустым' });
        }

        // Filter profanity
        if (filter.check(content)) {
            return res.status(400).json({
                message: 'Ваш комментарий содержит недопустимые слова и не может быть опубликован.'
            });
        }

        // Pass validation
        const newComment = new Comment({
            content: content,
            news: newsId,
            author: req.user.id // Get user ID from token (middleware attaches it)
        });

        const savedComment = await newComment.save();

        // Populate author data for response
        const populatedComment = await Comment.findById(savedComment._id).populate('author', 'username role');

        res.status(201).json(populatedComment);
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ message: 'Ошибка при сохранении комментария' });
    }
});

// Get comments for specific news item
router.get('/:newsId', async (req, res) => {
    try {
        const comments = await Comment.find({ news: req.params.newsId })
            .populate('author', 'username role') // Populate author name and role from User model
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: 'Ошибка при получении комментариев' });
    }
});

// Delete comment (author or admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Комментарий не найден' });
        }

        // Check permissions: comment author or admin
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