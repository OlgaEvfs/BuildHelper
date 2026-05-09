// Загружаем настройки
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Подключаем функцию из db.js
const connectDB = require('./config/db');

// Создаем приложение
const app = express();

// Подключаемся к БД
connectDB();

// Middleware
app.use(cors()); // Настраиваем cors, чтобы фронтенд обращался к бэкенду
app.use(express.json()); // Позволяет серверу понимать JSON в запросах(для POST/PUT)

// Подключаем маршруты
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Все маршруты к авторизации будут начинаться с /api/auth

// Роуты для новостей
const newsRoutes = require('./routes/news');
app.use('/api/news', newsRoutes); // Все маршруты к новостям будут начинаться с /api/news

// Роуты для комментариев
const commentRoutes = require('./routes/comments');
app.use('/api/comments', commentRoutes);

// Роуты для сохранения расчетов
const calculationRoutes = require('./routes/calculations');
app.use('/api/calculations', calculationRoutes);

// Роуты для чек-листа
const checklistRoutes = require('./routes/checklist');
app.use('/api/checklist', checklistRoutes);

// Роуты для планировщика
const plannerRoutes = require('./routes/planner');
app.use('/api/planner', plannerRoutes);

// test route
app.get('/api/test', (req, res) => {
    // Обязательно res.json, чтобы фронтенд понял ответ
    res.json({ message: 'This is a test endpoint' });
});

// Раздача статических файлов фронтенда
app.use(express.static(path.join(__dirname, '../frontend')));

// Все остальные GET запросы перенапрявляем на index.html (для SPA в будущем)
app.get('*path', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Берем порт из env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});