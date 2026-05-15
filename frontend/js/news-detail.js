document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID из URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    const contentContainer = document.getElementById('news-detail-content');
    const commentsList = document.getElementById('comments-list');
    const commentFormWrapper = document.getElementById('comment-form-wrapper');
    const loginReminder = document.getElementById('login-reminder');
    const commentForm = document.getElementById('comment-form');

    if (!newsId) {
        contentContainer.innerHTML = '<div class="alert alert-danger">ID новости не указан</div>';
        return;
    }

    // Проверяем авторизацию и получаем данные пользователя
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (token) {
        commentFormWrapper.classList.remove('d-none');
        loginReminder.classList.add('d-none');
    }

    // Загружаем новость
    try {
        // Запрос к API
        const response = await fetch(`/api/news/${newsId}`);
        if (!response.ok) throw new Error('Новость не найдена');
        const news = await response.json();

        // Отрисовка данных
        // Форматируем дату
        const date = new Date(news.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Создаем переменную для вакансии
        let jobDetailsHtml = '';

        // Если это вакансия добавляем информацию
        if (news.category === 'jobs') {
            jobDetailsHtml = `
                <div class="p-4 mb-4 rounded-4 border shadow-sm" style="background-color: #f8f9fa; border-left: 5px solid var(--accent-blue) !important;">
                    <div class="row text-center text-sm-start mb-3">
                        <div class="col-sm-4 mb-2 mb-sm-0">
                            <div class="text-muted small text-uppercase">Место работы</div>
                            <div class="fw-bold">${news.location || 'Не указано'}</div>
                        </div>
                        <div class="col-sm-4 mb-2 mb-sm-0">
                            <div class="text-muted small text-uppercase">Занятость</div>
                            <div class="fw-bold">${news.employment || 'Не указано'}</div>
                        </div>
                        <div class="col-sm-4">
                            <div class="text-muted small text-uppercase">Оплата</div>
                            <div class="fw-bold text-success">${news.salary || 'Договорная'}</div>
                        </div>
                        <!-- Контакты -->
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Контактное лицо</div>
                                <div class="fw-bold">${news.contactName || 'Работодатель'}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Email</div>
                                <a href="mailto:${news.contactEmail}" class="fw-bold text-decoration-none text-dark">
                                    ${news.contactEmail || 'Не указан'}
                                </a>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Телефон</div>
                                <a href="tel:${news.contactPhone}" class="fw-bold text-decoration-none mb-0" style="color: var(--accent-blue);">
                                    ${news.contactPhone || 'Не указан'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        contentContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <nav aria-label="breadcrumb" class="mb-4">
                        <div class="d-flex justify-content-end mb-3">
                            ${userInfo.role === 'admin' ? `
                                <a href="/admin.html#content-section" class="btn btn-sm btn-outline-dark">
                                    <i class="fas fa-shield-alt me-2"></i> Вернуться к модерации
                                </a>
                            ` : ''}
                        </div>
                        <ol class="breadcrumb bg-transparent p-0">
                            <li class="breadcrumb-item"><a href="/news.html" class="bh-text-orange text-decoration-none">Все новости</a></li>
                            <li class="breadcrumb-item active" aria-current="page">${news.title}</li>
                        </ol>
                    </nav>

                    <article class="news-article">
                        <h1 class="display-4 fw-bold mb-3">${news.title}</h1>
                        <div class="d-flex align-items-center gap-3 text-secondary mb-4">
                            <span class="badge bh-bg-orange">${news.category}</span>
                            <time datetime="${news.createdAt}">${date}</time>
                        </div>
                        <div class="img-wrapper mb-5 shadow-sm rounded-4 overflow-hidden">
                            <img src="${news.imageUrl}" class="img-fluid" alt="${news.title}" style="opacity: 1 !important;">
                        </div>
                        
                        ${jobDetailsHtml}
                        <div class="news-content fs-5 lh-lg">${news.content}</div>
                    </article>
                </div>
            </div>
        `;

        // Обновляем заголовок вкладки
        document.title = `${news.title} - BuildHelper`;

        // Загруэаем комментарии
        loadComments(newsId);

    } catch (error) {
        console.error('Error fetching news:', error);
        contentContainer.innerHTML = `
            <div class="text-center py-5">
                <h2 class="text-danger">Ошибка!</h2>
                <p>${error.message}</p>
                <a href="/news.html" class="btn bh-btn-primary mt-3">Вернуться к списку</a>
            </div>
        `;
    }

    // Функция загрузки комментариев
    async function loadComments(id) {
        try {
            const res = await fetch(`/api/comments/${id}`);
            const comments = await res.json();

            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="text-muted">Пока нет комментариев. Будьте первым!</p>';
                return;
            }

            commentsList.innerHTML = comments.map(c => {
                // Проверяем автор это или админ (для кнопки удаления)
                const isMyComment = c.author && c.author._id === userInfo._id;
                const iAmAdmin = userInfo.role === 'admin';
                const showDelete = isMyComment || iAmAdmin;
                
                // Проверяем, является ли АВТОР комментария админом (для значка)
                const authorIsAdmin = c.author && c.author.role === 'admin';

                return `
                    <div class="comment-item mb-4 shadow-sm border-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <span class="comment-author">${c.author ? c.author.username : 'Аноним'}</span>
                                ${authorIsAdmin ? '<span class="badge bg-dark ms-2" style="font-size: 0.6rem;">Admin</span>' : ''}
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="comment-date text-muted">${new Date(c.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                ${showDelete ? `
                                    <button class="btn btn-sm text-danger p-0 lh-1 delete-comment-btn" data-id="${c._id}" title="Удалить">&times;</button>
                                ` : ''}
                            </div>    
                        </div>
                        <div class="comment-text">${c.content}</div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    }

    //Обработка удаления комментария
    commentsList.addEventListener('click', async (e) => {
        //Если нажали на кнопку удаления
        if (e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.getAttribute('data-id');

            if (confirm('Удалить этот комментарий?')) {
                try {
                    const res = await fetch(`/api/comments/${commentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        loadComments(newsId);
                    } else {
                        const data = await res.json();
                        alert(data.message || 'Ошибка при удалении');
                    }
                } catch (err) {
                    console.error("Delete error:", err);
                    alert('Сервер недоступен');
                }
            }
        }
    });

    // Отправка комментария
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('comment-text').value;

            try {
                const res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: text, newsId })
                });

                if (res.ok) {
                    document.getElementById('comment-text').value = ''; // Очищаем форму
                    loadComments(newsId); // Перезагружаем список
                } else {
                    const errorData = await res.json();
                    alert(errorData.message || 'Ошибка при отправке комментария');
                }
            } catch (err) {
                console.error("Error posting comment:", err);
            }
        });
    }
});