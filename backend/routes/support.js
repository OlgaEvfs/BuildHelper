const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/SupportRequest');

// @desc Send support request (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля формы' });
        }

        const newRequest = new SupportRequest({
            name,
            email,
            subject,
            message
        });
        await newRequest.save();
        res.status(201).json({ message: 'Ваша заявка принята. Администратор свяжется с вами.' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при отправке заявки' });
    }
});

module.exports = router;