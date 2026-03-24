console.log("Frontend is running!");

// Пример запроса к нашему API
/* fetch('/api/test')
    .then(response => response.json())
    .then(data => {
        console.log('Response from API:', data.message);
    })
    .catch(err => console.error("Error fetching from API:", err)); */

// Функция обновления навигационной панели
function updateNavbar() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return; // Если элемент не найден, выходим

    const userData = localStorage.getItem('user');

    if (userData) {
        try {
            const user = JSON.parse(userData);

            // Если пользователь авторизован, показываем его имя и кнопку выхода
            let navHtml = `<span class="user-info">Привет, <strong>${user.username}</strong>!</span>`;

            // Если роль пользователя - администратор, показываем ссылку на админ панель
            if (user.role === 'admin') {
                navHtml += `<a href="/admin/index.html" class="admin-link">Админ панель</a>`;
            }

            navHtml += `<a href="#" id="logout-btn" class="logout-link">Выйти</a>`;

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
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
