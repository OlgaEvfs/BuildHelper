document.addEventListener('DOMContentLoaded', () => {
    // 1. Обновляем навигацию
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }

    // 2. Глобальная функция уведомлений
    window.showNotification = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} shadow-sm position-fixed top-0 end-0 m-3 z-index-1060`;
        toast.style.minWidth = '250px';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // 3. Загружаем новости
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

    // 5. Кнопка "Вверх"
    const btnUp = document.querySelector('.btn-up');
    if (btnUp) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btnUp.classList.add('show');
            } else {
                btnUp.classList.remove('show');
            }
        });

        btnUp.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Отображение калькуляторов только для авторизованных
    const authOnlyCalcs = document.querySelectorAll('.auth-only-calc');
    if (localStorage.getItem('userInfo')) {
        authOnlyCalcs.forEach(calc => {
            calc.style.display = 'block';
        });
    }
});