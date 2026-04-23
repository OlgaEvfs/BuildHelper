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

    // Проверяем авторизацию для показа формы
    const token = localStorage.getItem('token');
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

        contentContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <nav aria-label="breadcrumb" class="mb-4">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="/news.html" class="bh-text-orange">Все новости</a></li>
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
                            <img src="${news.imageUrl}" class="img-fluid" alt="${news.title}">
                        </div>
                        
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

            commentsList.innerHTML = comments.map(c => `
                <div class="comment-item mb-4 shadow-sm border-0">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="comment-author">${c.author ? c.author.username : 'Аноним'}</span>
                        <span class="comment-date text-muted">${new Date(c.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="comment-text">${c.content}</div>
                </div>
            `).join('');
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    }

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
                    alert('Ошибка при отправке комментария');
                }
            } catch (err) {
                console.error("Error posting comment:", err);
            }
        });
    }
});