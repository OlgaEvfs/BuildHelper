document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const filters = document.getElementById('news-filters');
    const token = localStorage.getItem('token');
    const addJobContainer = document.getElementById('add-job-container');
    const pagination = document.getElementById('pagination');

    let currentCategory = 'all';
    let currentPage = 1;
    let currentJobType = 'all';

    // Обработка кликов по фильтрам
    filters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            currentPage = 1;
            currentJobType = 'all'; // Сбрасываем подкатегорию при смене основной категории

            // Показываем или скрываем подкатегории для вакансий
            const jobFilters = document.getElementById('job-filters');
            if (currentCategory === 'jobs') {
                jobFilters.classList.remove('d-none');
            } else {
                jobFilters.classList.add('d-none');
            }

            loadNews();
            checkAddJobButton();
        }
    });

    // Добавляем обработчик для подкатегорий вакансий
    const jobFilters = document.getElementById('job-filters');
    jobFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            jobFilters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentJobType = e.target.getAttribute('data-jobtype');
            currentPage = 1;
            loadNews();
        }
    });

    // Функция загрузки новостей с сервера
    async function loadNews() {
        // Если новостей еще нет — показываем спиннер, если есть — только прозрачность
        if (newsGrid.children.length === 0 || newsGrid.querySelector('.bh-loader-container')) {
            showLoader();
        } else {
            newsGrid.classList.add('loading');
        }
        
        try {
            let url = `/api/news?page=${currentPage}&limit=6`;

            if (currentCategory !== 'all') {
                url += `&category=${currentCategory}`;
            }

            if (currentCategory === 'jobs' && currentJobType !== 'all') {
                url += `&jobType=${currentJobType}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            renderNews(data.news);
            renderPagination(data.pagination);
        } catch (error) {
            newsGrid.innerHTML = '<div class="text-center text-danger">Ошибка загрузки</div>';
        } finally {
            newsGrid.classList.remove('loading'); // Убираем эффект загрузки в любом случае
        }
    }

    // Функция для рендера новостей на страницу
    function renderNews(news) {
        if (!news || news.length === 0) {
            newsGrid.innerHTML = `
                <div class="col-12" style="width: 100% !important; display: flex !important; justify-content: center !important; padding: 80px 0;">
                    <div style="text-align: center !important;">
                        <h3 class="fw-bold">Новостей не найдено</h3>
                        <p class="text-muted">Попробуйте выбрать другую категорию или фильтр</p>
                    </div>
                </div>
            `;
            return;
        }

        newsGrid.innerHTML = news.map(item => `
            <div class="col">
                <div class="news-card">
                    <img src="${item.imageUrl || 'images/logo.png'}" alt="${item.title}">
                    <div class="news-card-content">
                        <small>${getCategoryName(item.category)} • ${new Date(item.createdAt).toLocaleDateString()}</small>
                        <h3>${item.title}</h3>
                        <p>${item.content.substring(0, 120)}...</p>
                        <div class="text-center mt-auto">
                            <a href="/news-detail.html?id=${item._id}" class="btn bh-btn-outline">Читать полностью</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Логика показа кнопки "Добавить"
    // Проверяем: залогинен ли пользователь и выбрана ли категория 'jobs'
    function checkAddJobButton() {
        const token = localStorage.getItem('token');
        if (token && currentCategory === 'jobs') {
            addJobContainer.classList.remove('d-none');
        } else {
            addJobContainer.classList.add('d-none');
        }
    }

    checkAddJobButton();
   
    // Обработка отправки формы вакансии
    const addJobForm = document.getElementById('add-job-form');
    if (addJobForm) {
        addJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('job-form-message');
               
            const jobData = {
                title: document.getElementById('job-title').value,
                category: 'jobs',
                jobType: document.getElementById('job-type').value,
                employment: document.getElementById('job-employment').value,
                location: document.getElementById('job-location').value,
                salary: document.getElementById('job-salary').value,
                content: document.getElementById('job-content').value,
                contactName: document.getElementById('job-contact-name').value,
                contactPhone: document.getElementById('job-contact-phone').value,
                contactEmail: document.getElementById('job-contact-email').value,
            };
   
            try {
                const res = await fetch('/api/news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                });

                if (res.ok) {
                    msg.textContent = 'Вакансия успешно опубликована!';
                    msg.className = 'alert alert-success mt-3';
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
                        modal.hide();
                        addJobForm.reset();
                        msg.classList.add('d-none');
                        // Перезагружаем страницу, чтобы увидеть новую вакансию в списке
                        window.location.reload();
                    }, 1500);
                } else {
                    const err = await res.json();
                    msg.textContent = err.message || 'Ошибка при создании';
                    msg.className = 'alert alert-danger mt-3';
                }
            } catch (error) {
                msg.textContent = 'Ошибка сети';
                msg.className = 'alert alert-danger mt-3';
            }
        });
    }

    // Функция для рендера пагинации
    function renderPagination(pageInfo) {
        const { totalPages, currentPage: page } = pageInfo;
        let html = '';

        // Теперь показываем пагинацию, даже если страница одна, чтобы убедиться в работоспособности
        if (!totalPages || totalPages === 0) {
            pagination.innerHTML = '';
            return;
        }

        // Кнопка Назад
        html += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="window.changePage(${page - 1})">«</button>
            </li>
        `;

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link" onclick="window.changePage(${i})">${i}</button>
                </li>
            `;
        }

        // Кнопка Вперед
        html += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="window.changePage(${page + 1})">»</button>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // Делаем функцию глобальной, чтобы onclick в HTML её видел
    window.changePage = (page) => {
        if (page < 1) return;
        currentPage = page;
        loadNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Изначальная загрузка новостей
    function showLoader() {
        newsGrid.innerHTML = `
            <div class="col-12" style="width: 100% !important;">
                <div class="bh-loader-container">
                    <div class="bh-spinner"></div>
                    <div class="bh-loader-text">Загружаем список новостей...</div>
                </div>
            </div>
        `;
    }

    // Функция для получения читаемого названия категории
    function getCategoryName(cat) {
        const categories = {
            'tech': 'Технологии',
            'market': 'Рынок',
            'experts': 'Эксперты',
            'calendar': 'Календарь',
            'jobs': 'Вакансии'
        };
        return categories[cat] || 'Новости';
    }

    loadNews();
});