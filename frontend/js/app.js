document.addEventListener('DOMContentLoaded', () => {
    // 1. Обновляем навигацию
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }

    // 2. Загружаем новости
    if (typeof fetchNews === 'function') {
        fetchNews();
    }

    // 3. Инициализируем чек-лист
    if (typeof initChecklist === 'function') {
        initChecklist();
    }

    // 4. Вешаем клик на карточки калькуляторов
    const cards = document.querySelectorAll('.calc-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-calc');
            if (typeof openCalculatorModal === 'function') {
                openCalculatorModal(type);
            }
        });
    });
});