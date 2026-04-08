require('dotenv').config(); // Загружаем переменные окружения из .env файла
const mongoose = require('mongoose');
const News = require('./models/News');
const connectDB = require('./config/db');

// Данные для заполнения
const newsData = [
    {
        title: "3D-печать домов: Экономия 40%",
        content: "Технология возведения зданий с помощью строительных 3D-принтеров выходит на новый уровень. Первые жилые кварталы в Европе уже заселены...",
        category: "tech",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    },
    {
        title: "Прогноз цен на арматуру",
        content: "Аналитики прогнозируют стабилизацию цен на металлопрокат к началу летнего сезона. Ожидается рост спроса в частном секторе...",
        category: "market",
        imageUrl: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=800"
    },
    {
        title: "Интервью: Современная архитектура",
        content: "Ведущий архитектор города рассказывает о трендах в проектировании загородных домов: панорамное остекление и плоские кровли...",
        category: "experts",
        imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=800"
    },
    {
        title: "Выставка BuildEx 2026",
        content: "Estonia BuildEx 2026 приглашает профессионалов строительной отрасли на крупнейшую выставку инновационных материалов и технологий...",
        category: "calendar",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800"
    },
    {
        title: "Мастер отделочных работ",
        content: "Крупная компания ищет опытных специалистов по внутренней отделке. Работа на объектах бизнес-класса. Сдельная оплата...",
        category: "jobs",
        jobType: "finishing",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55?q=80&w=800"
    },
    {
        title: "Электромонтажник (Таллинн)",
        content: "Требуется специалист с допуском. Монтаж систем умного дома в новых квартирных домах. Полная занятость...",
        category: "jobs",
        jobType: "electrical",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800"
    }
];

// Функция для заполнения базы данных
const seedDB = async () => {
    try {
        await connectDB(); // Подключаемся к базе данных
        await News.deleteMany({}); // Очищаем коллекцию от старых данных
        await News.insertMany(newsData); // Вставляем новые данные
        console.log('Данные успешно добавлены в MongoDB!');
        process.exit(); // Завершаем процесс после выполнения
    } catch (err) {
        console.error('Ошибка при заполнении базы данных:', err);
        process.exit(1); // Завершаем процесс с ошибкой
    }
};

seedDB(); // Запускаем функцию заполнения базы данных