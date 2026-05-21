const express = require('express');
const router = express.Router();
const Checklist = require('../models/Checklist');
const authMiddleware = require('../middleware/authMiddleware');

// Get all user tasks
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Sort tasks by creation date
        const tasks = await Checklist.find({ user: req.user.id }).sort({ createdAt: 1 });
        res.json(tasks);
    } catch (err) {
        console.error("Ошибка при получении чек-листа:", err);
        res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    }
});

// Add new task
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Текст задачи пуст' });

        const newTask = new Checklist({
            user: req.user.id,
            text
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при создании задачи' });
    }
});

// Update task status (completed/not completed)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Checklist.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Задача не найдена' });

        // Verify task belongs to this user
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав на изменение' });
        }

        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении задачи' });
    }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Checklist.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Задача не найдена' });

        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        await Checklist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Задача удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении задачи' });
    }
});

module.exports = router;