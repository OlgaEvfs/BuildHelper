const express = require('express');
const router = express.Router();
const Planner = require('../models/Planner');
const auth = require('../middleware/authMiddleware');

// Get user plan
router.get('/', auth, async (req, res) => {
    try {
        const plan = await Planner.findOne({ user: req.user.id });
        res.json(plan || { rooms: [], furniture: [], openings: [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при загрузке плана' });
    }
});

// Save or update plan
router.post('/', auth, async (req, res) => {
    const { rooms, furniture, openings } = req.body;
    try {
        let plan = await Planner.findOne({ user: req.user.id });
        
        if (plan) {
            plan.rooms = rooms;
            plan.furniture = furniture;
            plan.openings = openings;
            plan.updatedAt = Date.now();
            await plan.save();
        } else {
            plan = new Planner({
                user: req.user.id,
                rooms,
                furniture,
                openings
            });
            await plan.save();
        }
        res.json({ message: 'План успешно сохранен', plan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при сохранении плана' });
    }
});

module.exports = router;