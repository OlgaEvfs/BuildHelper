document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const filters = document.getElementById('news-filters');
    const pagination = document.getElementById('pagination');

    let currentCategory = 'all';
    let currentPage = 1;

    // Инициализация
    loadNews();

    // Обработка кликов по фильтрам
    if (filters) {
        filters.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                filters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.getAttribute('data-category');
                currentPage = 1;
                loadNews();
            }
        });
    }

    async function loadNews() {
        showLoader();
        try {
            let url = `/api/news?page=${currentPage}&limit=6`;
            if (currentCategory !== 'all') {
                url += `&category=${currentCategory}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            renderNews(data.news);
            renderPagination(data.pagination);
        } catch (error) {
            console.error('Ошибка загрузки новостей:', error);
            newsGrid.innerHTML = '<div class="col-12 text-center text-danger">Ошибка при загрузке новостей. Попробуйте позже.</div>';
        }
    }

    function renderNews(news) {
        if (!news || news.length === 0) {
            newsGrid.innerHTML = '<div class="col-12 text-center p-5"><h3>Новостей не найдено</h3></div>';
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
                        <a href="/news-detail.html?id=${item._id}" class="btn bh-btn-outline mt-auto">Читать полностью</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

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

    function showLoader() {
        newsGrid.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="spinner-border bh-text-accent" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2 text-muted">Загрузка новостей...</p>
            </div>
        `;
    }

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
});