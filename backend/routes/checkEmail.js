const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Check if email is already in use
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;