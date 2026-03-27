// console.log("Frontend is running!");

//Пример запроса к нашему API
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

    // Функция для открытия модалки
    function openCalculatorModal(type) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';

        let title = "";
        let content = "";

        // Выбор контента
        switch(type) {
            case 'geometry':
                title = "Геометрия помещения";
                content = `
                    <div class="form-group">
                        <label>Длина (м):</label>
                        <input type="number" id="room-length" placeholder="0.0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Ширина (м):</label>
                        <input type="number" id="room-width" placeholder="0.0" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Высота (м):</label>
                        <input type="number" id="room-height" placeholder="0.0" step="0.1">
                    </div>
                    <hr style="margin: 20px 0; border: 0.5px solid #eee;">
                    <div id="openings-list">
                        <!-- Сюда будем добавлять двери и окна -->
                    </div>
                    <button class="btn-secondary" onclick="addOpeningRow()">+ Добавить проем</button>

                    <div id="calc-result" class="result-box" style="margin-top: 20px; padding:15px; background:#f0f7ff; border-radius: 8px; display: none;">
                        <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculateGeometry()">Рассчитать</button>
                `;
                break;

            case 'paint':
                title = "Расход грунтовки или краски";
                // форма для краски
                break;
        }

        // Собираем модалку
        overlay.innerHTML = `
            <div class="modal-window">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <span class="close-modal" id="close-modal">&times;</span>
                </div>
                <div class="modal-content">${content}</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Закрытие
        document.getElementById('close-modal').onclick = () => overlay.remove();
        overlay.onclick = (e) => { if (e.target.id === 'modal-overlay') overlay.remove(); };
    }

    // Вешаем клик на карточки
    const cards = document.querySelectorAll('.calc-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-calc');
            openCalculatorModal(type);
        });
    });
});

// Функция расчета геометрии
window.calculateGeometry = function() {
    const length = parseFloat(document.getElementById('room-length').value) || 0;
    const width = parseFloat(document.getElementById('room-width').value) || 0;
    const height = parseFloat(document.getElementById('room-height').value) || 0;

    if (length <= 0 || width <= 0 || height <= 0) {
        alert("Пожалуйста, введите корректные размеры комнаты.");
        return;
    }

    const perimeter = (length + width) * 2;
    const floorArea = (length * width).toFixed(2);
    const grossWallArea = perimeter * height; // "Грязная" площадь (без учета проемов)

    // Расчет проемов
    let totalOpeningsArea = 0;
    const openingRows = document.querySelectorAll('.opening-row');

    openingRows.forEach(row => {
        const opW = parseFloat(row.querySelector('.op-width').value) || 0;
        const opH = parseFloat(row.querySelector('.op-height').value) || 0;
        const opQty = parseFloat(row.querySelector('.op-qty').value) || 1;
        totalOpeningsArea += (opW * opH * opQty);
    });

    const netWallArea = (grossWallArea - totalOpeningsArea).toFixed(2); // "Чистая" площадь стен

    const resultBox = document.getElementById('calc-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Периметр: <strong>${perimeter.toFixed(2)} м.п.</strong></p>
        <p>Площадь пола: <strong>${floorArea} м²</strong></p>
        <p>Сумма проемов: <strong>${totalOpeningsArea.toFixed(2)} м²</strong></p>
        <p style="color:var(--accent-blue); font-size:1.1rem;">Чистая площадь стен: <strong>${netWallArea} м²</strong></p>
    `;
};

// Функция для добавления блока, чтобы вычитать оконные и дверные проемы
window.addOpeningRow = function() {
    const openingsList = document.getElementById('openings-list');
    const row = document.createElement('div');
    row.className = 'opening-row';
    row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';

    row.innerHTML = `
        <select class="opening-type" style="padding:5px;">
            <option value="door">Дверь</option>
            <option value="window">Окно</option>
        </select>
        <input type="number" class="op-width" placeholder="Ш (м)" style="width: 70px; padding:5px;" step="0.1">
        <input type="number" class="op-height" placeholder="В (м)" style="width: 70px; padding:5px;" step="0.1">
        <input type="number" class="op-qty" placeholder="Кол-во" style="width: 70px; padding:5px;" value="1">
        <button onclick="this.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2rem;">&times;</button>
    `;
    openingsList.appendChild(row);
};
