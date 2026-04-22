document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID из URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    const contentContainer = document.getElementById('news-detail-content');

    if (!newsId) {
        contentContainer.innerHTML = '<div class="alert alert-danger">ID новости не указан</div>';
        return;
    }

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

                        <img src="${news.imageUrl}" class="img-fluid rounded-4 mb-5 shadow-sm" alt="${news.title}" style="width: 100%; max-height: 500px; object-fit: cover;">

                        <div class="news-content fs-5 lh-lg">${news.content}</div>
                    </article>
                </div>
            </div>
        `;

        // Обновляем заголовок вкладки
        document.title = `${news.title} - BuildHelper`;

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
});