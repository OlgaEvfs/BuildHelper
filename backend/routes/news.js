const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get current user's jobs
router.get('/my-jobs', authMiddleware, async (req, res) => {
    try {
        const jobs = await News.find({ author: req.user.id, category: 'jobs' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении вакансий' });
    }
});

// Get news with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const jobType = req.query.jobType;

        let query = { status: 'published' };
        if (category && category !== 'all') query.category = category;
        if (jobType && jobType !== 'all') query.jobType = jobType;

        const skip = (page - 1) * limit;

        const [totalItems, news] = await Promise.all([
            News.countDocuments(query),
            News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        ]);

        res.json({ news, pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page } });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при получении новостей' });
    }
});

// Get a single news item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await News.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при получении новости' });
    }
});

router.post('/', authMiddleware, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            return res.status(400).json({ message: 'Ошибка загрузки файла: ' + err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        
        // Extract all possible fields from req.body
        const { 
            title, content, category, imageUrl, 
            jobType, location, employment, salary, 
            contactName, contactEmail, contactPhone 
        } = req.body;

        // Validate mandatory fields
        if (!title || !content || !category) {
            return res.status(400).json({ 
                message: 'Заполните обязательные поля (Заголовок, Содержимое, Категория)',
                received: { title: !!title, content: !!content, category: !!category } 
            });
        }

        // Validate jobs
        if (category === 'jobs') {
            if (!jobType || !location || !salary || !contactName || !contactEmail || !contactPhone) {
                return res.status(400).json({ message: 'Для вакансии должны быть заполнены все поля: Тип, Локация, Оплата, Контактное имя, Email и Телефон.' });
            }
            
            // Estonian phone number: 7 to 15 digits, may start with +
            const phoneRegex = /^\+?\d{7,15}$/;
            if (!phoneRegex.test(contactPhone.replace(/\s/g, ''))) {
                return res.status(400).json({ message: 'Укажите корректный эстонский номер телефона (минимум 7 цифр).' });
            }
        }

        if (category !== 'jobs' && !isAdmin) {
            return res.status(403).json({ message: 'Обычные пользователи могут создавать только вакансии' });
        }

        const vacancyImages = {
            finishing: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800',
            plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800',
            electrical: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=800',
            masonry: 'https://images.unsplash.com/photo-1590059132718-5021f4bc1296?q=80&w=800',
            roofing: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?q=80&w=800',
            hvac: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800',
            general: 'https://images.unsplash.com/photo-1504307651254-35680f336dbd?q=80&w=800'
        };

        const defaultNewsImage = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800';

        let finalImageUrl = (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') ? imageUrl.trim() : null;

        // Use uploaded file if present, takes priority
        if (req.file) {
            finalImageUrl = `/uploads/${req.file.filename}`;
        }

        if (!finalImageUrl) {
            if (category === 'jobs') {
                const type = (jobType || 'general').toLowerCase();
                finalImageUrl = vacancyImages[type] || vacancyImages.general;
            } else {
                finalImageUrl = defaultNewsImage;
            }
        }

        const newPost = new News({
            author: req.user._id || req.user.id,
            title: title.trim(), 
            content: content.trim(), 
            category: category.trim(), 
            imageUrl: finalImageUrl,
            jobType: category === 'jobs' ? (jobType || 'general') : null, 
            location: location ? location.trim() : '', 
            employment: employment || null, 
            salary: salary ? salary.trim() : '',
            contactName: contactName ? contactName.trim() : '', 
            contactEmail: contactEmail ? contactEmail.trim() : '', 
            contactPhone: contactPhone ? contactPhone.trim() : '',
            status: isAdmin ? 'published' : 'pending'
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (dbErr) {
        console.error('ОШИБКА ПРИ СОЗДАНИИ ЗАПИСИ:', dbErr);
        const errorMsg = dbErr.errors ? Object.values(dbErr.errors).map(e => e.message).join(', ') : dbErr.message;
        res.status(500).json({ message: 'Ошибка сохранения: ' + errorMsg });
    }
});

// Edit (Author or Admin)
router.put('/:id', authMiddleware, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            return res.status(400).json({ message: 'Ошибка загрузки файла: ' + err.message });
        }
        next();
    });
}, async (req, res) => {
    console.log(`--- [BACKEND] PUT /api/news/${req.params.id} ---`);
    try {
        const post = await News.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Запись не найдена' });

        const isAuthor = post.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        const updateData = { ...req.body };
        
        // Update image path if new file is uploaded
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        if (updateData.category && updateData.category !== 'jobs' && !isAdmin) {
            return res.status(403).json({ message: 'Только администратор может использовать эту категорию' });
        }

        if (!isAdmin) {
            updateData.status = 'pending';
        }

        const updatePost = await News.findByIdAndUpdate(req.params.id, { $set: updateData }, { returnDocument: 'after', runValidators: true });
        res.json(updatePost);
    } catch (err) {
        console.error('ОШИБКА ПРИ ОБНОВЛЕНИИ ЗАПИСИ:', err);
        const errorMsg = err.errors ? Object.values(err.errors).map(e => e.message).join(', ') : err.message;
        res.status(500).json({ message: 'Ошибка при обновлении: ' + errorMsg });
    }
});

// Delete (Author or Admin)
router.delete('/:id', authMiddleware, async (req,res) => {
    try {
        const post = await News.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Запись не найдена' });

        const isAuthor = post.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        // If there is an image and it's local (starts with /uploads/)
        if (post.imageUrl && post.imageUrl.startsWith('/uploads/')) {
            // Convert url to file path: /uploads/filename.jpg -> ../uploads/filename.jpg
            const fileName = post.imageUrl.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            // Delete file if it exists
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'Запись и картинка удалены' });
    } catch (err) {
        console.error('Ошибка при удалении:', err);
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
});

module.exports = router;