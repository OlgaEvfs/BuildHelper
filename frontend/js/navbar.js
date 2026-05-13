window.updateNavbar = function() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return; // Если элемент не найден, выходим

    const userData = localStorage.getItem('userInfo');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // Если пользователь авторизован, показываем его имя и кнопку выхода
            let navHtml = `
                <span class="navbar-text me-3 d-none d-lg-inline">Привет, <strong>${user.username}</strong>!</span>
            `;

            // Если роль пользователя - администратор, показываем ссылку на админ панель
            if (user.role === 'admin') {
                navHtml += `<a href="/admin/users.html" class="btn btn-sm btn-dark me-2">Админ-панель</a>`;
            } else {
                navHtml += `<a href="/user/profile.html" class="btn btn-sm bh-btn-accent me-2">Кабинет</a>`;
            }

            navHtml += `<button id="logout-btn" class="btn btn-sm btn-outline-danger">Выйти</button>`;

            authLinks.innerHTML = navHtml;

            // Добавляем обработчик для кнопки выхода
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userInfo'); // Удаляем данные пользователя из localStorage
                window.location.href = '/'; // Перенаправляем на главную страницу
            });

        } catch (error) {
            console.error("Ошибка при парсинге данных пользователя:", error);
            localStorage.removeItem('userInfo'); // Если данные повреждены, удаляем их
        }
    }

    const reminder = document.getElementById('reg-reminder');
    if (reminder) {
        if (localStorage.getItem('userInfo')) {
            reminder.classList.add('d-none');
            reminder.classList.remove('d-flex');
        } else {
            reminder.classList.remove('d-none');
            reminder.classList.add('d-flex');
        }
    }
};

updateNavbar();