// Функция для получения и отображения новостей
window.fetchNews = async function() {
    const contentContainer = document.querySelector('.tabcontainer-content');
    const itemsContainer = document.querySelector('.tabheader-items');

    if (!contentContainer || !itemsContainer) return;

    // Показываем лоадер перед загрузкой
    contentContainer.innerHTML = '<div class="bh-loader-container"><div class="bh-spinner"></div><div class="bh-loader-text">Загрузка новостей...</div></div>';

    try {
        const response = await fetch('/api/news?limit=5');
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }

        const data = await response.json();
        const news = data.news; 

        contentContainer.innerHTML = ''; 
        itemsContainer.innerHTML = ''; // Очищаем список заголовков перед добавлением новых

        if (!news || news.length === 0) {
            contentContainer.innerHTML = `
                <div class="p-5 text-center">
                    <p class="text-muted">Новостей пока нет. Мы скоро добавим что-нибудь интересное!</p>
                </div>`;
            return;
        }

        // Вспомогательные функции для перевода
        const getCategoryName = (cat) => {
            const categories = { 'tech': 'Технологии', 'market': 'Рынок', 'experts': 'Эксперты', 'calendar': 'Календарь', 'jobs': 'Вакансии' };
            return categories[cat] || 'Новости';
        };

        const getJobTypeName = (type) => {
            const types = { 'finishing': 'Отделка', 'plumbing': 'Сантехника', 'electrical': 'Электрика', 'masonry': 'Камень', 'roofing': 'Кровля', 'hvac': 'Вентиляция', 'general': 'Общие работы' };
            return types[type] || 'Общие работы';
        };

        news.forEach((item, i) => {
            const contentBlock = document.createElement('div');
            contentBlock.className = 'tabcontent';
            contentBlock.setAttribute('data-category', item.category);
            if (item.jobType) contentBlock.setAttribute('data-job-type', item.jobType);

            const label = item.category === 'jobs' ? `Вакансия: ${getJobTypeName(item.jobType)}` : `Новость: ${getCategoryName(item.category)}`;

            contentBlock.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="tabcontent-desc">
                    <div class="news-date">
                        <span class="bh-text-orange fw-bold">${label}</span> • 
                        ${new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2>${item.title}</h2>
                    <p>${item.content.length > 120 ? item.content.substring(0, 120) + '...' : item.content}</p>
                    <a href="/news-detail.html?id=${item._id}" class="btn-read">${item.category === 'jobs' ? 'Откликнуться' : 'Читать далее'}</a>
                </div>
            `;
            contentContainer.appendChild(contentBlock);

            const headerItem = document.createElement('div');
            headerItem.className = 'tabheader-item';
            headerItem.setAttribute('data-category', item.category);
            if (item.jobType) headerItem.setAttribute('data-job-type', item.jobType);
            headerItem.textContent = item.title;

            itemsContainer.appendChild(headerItem);
        });

        if (data.pagination.totalItems > 5) {
            const allNewsLink = document.createElement('a');
            allNewsLink.href = "/news.html";
            allNewsLink.className = "tabheader-all-news bh-text-accent";
            allNewsLink.innerHTML = "Все новости →";
            itemsContainer.appendChild(allNewsLink);
        }

        window.initNewsTabs();

    } catch (err) {
        console.error("Ошибка загрузки новостей:", err);
        contentContainer.innerHTML = `
            <div class="p-5 text-center">
                <p style="color: var(--error-red); font-weight: 600;">Не удалось загрузить новости</p>
                <button class="btn btn-sm bh-btn-outline mt-2" onclick="fetchNews()">Повторить попытку</button>
            </div>`;
    }
};

// Функция инициализации табов для новостей
window.initNewsTabs = function() {
    const tabs = document.querySelectorAll('.tabheader-item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        itemsParent = document.querySelector('.tabheader-items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.style.display = 'none';
        });
        tabs.forEach(item => item.classList.remove('tabheader-item-active'));
    }

    function showTabContent(i = 0) {
        if (tabs[i] && tabsContent[i]) {
            hideTabContent();
            tabsContent[i].style.display = 'block';
            tabs[i].classList.add('tabheader-item-active');
        }
    }

    if (itemsParent) {
        itemsParent.onclick = (e) => {
            const target = e.target;
            if (target && target.classList.contains('tabheader-item')) {
                tabs.forEach((item, i) => {
                    if (target == item) showTabContent(i);
                });
            }
        };
    }

    // Показываем первую вкладку сразу после генерации
    if (tabs.length > 0) {
        showTabContent(0);
    }
};