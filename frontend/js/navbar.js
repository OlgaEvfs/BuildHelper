window.updateNavbar = function() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return; // Если элемент не найден, выходим

    const userData = localStorage.getItem('user');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // Если пользователь авторизован, показываем его имя и кнопку выхода
            let navHtml = `<span class="navbar-text me-3">Привет, <strong>${user.username}</strong>!</span>`;

            // Если роль пользователя - администратор, показываем ссылку на админ панель
            if (user.role === 'admin') {
                navHtml += `<a href="/admin/index.html" class="btn btn-sm btn-warning me-2">Админ</a>`;
            }

            navHtml += `<button id="logout-btn" class="btn btn-sm btn-outline-danger">Выйти</button>`;

            authLinks.innerHTML = navHtml;

            // Добавляем обработчик для кнопки выхода
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user'); // Удаляем данные пользователя из localStorage
                localStorage.removeItem('token'); // Удаляем токен из localStorage
                window.location.href = '/'; // Перенаправляем на главную страницу
            });

        } catch (error) {
            console.error("Ошибка при парсинге данных пользователя:", error);
            localStorage.removeItem('user'); // Если данные повреждены, удаляем их
        }
    }

    const reminder = document.getElementById('reg-reminder');
    if (reminder) {
        // Если данные пользователя есть — скрываем плашку (none), если нет — показываем (block)
        reminder.style.display = localStorage.getItem('user') ? 'none' : 'block';
    }
};