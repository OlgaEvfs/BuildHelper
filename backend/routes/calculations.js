const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');
const authMiddleware = require('../middleware/authMiddleware');

// Save new calculation
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, result } = req.body;

        if (!type || !result) {
            return res.status(400).json({ message: 'Неполные данные для сохранения' });
        }

        const newCalc = new Calculation({
            user: req.user.id,
            type,
            result
        });

        await newCalc.save();
        res.status(201).json(newCalc);
    } catch (err) {
        console.error('Ошибка сохранения расчета:', err);
        res.status(500).json({ message: 'Ошибка сервера при сохранении' });
    }
});

// Get all calculations for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const calcs = await Calculation.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(calcs);
    } catch (err) {
        console.error('Ошибка получения расчетов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Delete calculation
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const calc = await Calculation.findById(req.params.id);

        if (!calc) return res.status(404).json({ message: 'Расчет не найден' });

        // Check if calculation belongs to this user
        if (calc.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        await Calculation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Расчет удален' });
    } catch (err) {
        console.error('Ошибка удаления расчета:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;