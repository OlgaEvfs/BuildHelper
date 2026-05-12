const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/SupportRequest');

// @desc Отправить запрос в поддержку (публичный)
router.post('/', async (req, res) => {
    try {
        const { email, message, contactInfo } = req.body;

        if (!email || !message || !contactInfo) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля формы' });
        }

        const newRequest = new SupportRequest({
            email,
            message,
            contactInfo
        });
        await newRequest.save();
        res.status(201).json({ message: 'Ваша заявка принята. Администратор свяжется с вами.' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при отправке заявки' });
    }
});

module.exports = router;