window.updateNavbar = function() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return; // Если элемент не найден, выходим

    const userData = localStorage.getItem('userInfo');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // Если пользователь авторизован, показываем выпадающее меню
            // Используем dropdown-menu-end для корректного выравнивания
            const isAdmin = user.role === 'admin';
            let navHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Привет, <strong>${user.username}</strong>!
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        ${isAdmin ? 
                            '<li><a class="dropdown-item" href="/admin.html">Админ-панель</a></li>' : 
                            '<li><a class="dropdown-item" href="/profile.html">Кабинет</a></li>'
                        }
                        <li><hr class="dropdown-divider"></li>
                        <li><button id="logout-btn" class="dropdown-item text-danger logout-item">Выйти</button></li>
                    </ul>
                </div>
            `;

            authLinks.innerHTML = navHtml;

            // Добавляем обработчик для кнопки выхода
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
                window.location.href = '/';
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