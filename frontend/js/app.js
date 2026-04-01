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

        // Достаем сохраненные данные в localStorage
        const savedWallArea = sessionStorage.getItem('lastNetWallArea') || "";
        const savedFloorArea = sessionStorage.getItem('lastFloorArea') || "";
        const savedPerimeter = sessionStorage.getItem('lastPerimeter') || "";

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
                    <button class="btn-helper" onclick="addOpeningRow()">+ Добавить проем</button>

                    <div id="calc-result" class="result-box" style="margin-top: 20px; padding:15px; background:#f0f7ff; border-radius: 8px; display: none;">
                        <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculateGeometry()">Рассчитать</button>
                `;
                break;

            case 'paint':
                title = "Расход грунтовки или краски";
                content = `
                    <div class="form-group">
                        <label>Площадь стен (м²):</label>
                        <input type="number" id="paint-area" value="${savedWallArea || ''}" placeholder="0.0" step="0.1">
                        
                        ${savedWallArea ? '<small style="color:green;">Подставлено из Геометрии</small>' : '<small style="color:#666;">(Возьмите из расчета Геометрии)</small>'}
                        ${(savedWallArea && savedFloorArea) ? `
                            <div style="margin-top: 5px;">
                                <button type="button"  class="btn-helper" 
                                    onclick="toggleAreaValue(this, 'paint-area', '${savedWallArea}', '${savedFloorArea}')">
                                    Использовать пол (${savedFloorArea} м²)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="form-group">
                        <label>Расход (м²/л):</label>
                        <input type="number" id="paint-consumption" placeholder="например 10" step="1">
                    </div>
                    <div class="form-group">
                        <label>Количество слоев:</label>
                        <input type="number" id="paint-layers" value="2" step="1">
                    </div>

                    <div id="paint-result" class="result-box" style="margin-top: 20px; padding:15px; background:#f0f7ff; border-radius: 8px; display: none;">
                        <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculatePaint()">Рассчитать</button>
                `;
                break;
            
            case 'wallpaper':
                title = "Расчет обоев";
                content = `
                    <div class="form-group">
                        <label>Площадь стен (м²):</label>
                        <input type="number" id="wallpaper-area" value="${savedWallArea || ''}" placeholder="0.0" step="0.1">
                        ${savedWallArea ? '<small style="color:green;">Подставлено из Геометрии</small>' : '<small style="color:#666;">(Возьмите из расчета Геометрии)</small>'}
                    </div>
                    <div class="form-group">
                        <label>Ширина рулона (м):</label>
                        <select id="roll-width" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="0.53">0.53 м (стандарт)</option>
                            <option value="1.06">1.06 м (метровые)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Длина рулона (м):</label>
                        <select id="roll-length" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="10.05">10.05 м (стандарт)</option>
                            <option value="25">25 м (проф)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Высота стены (м):</label>
                        <input type="number" id="wall-height" value="2.5" step="0.1">
                        <small style="color:#666;">Высота влияет на количестсво полос</small>
                    </div>

                    <div id="wallpaper-result" class="result-box" style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; display: none;">
                            <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculateWallpaper()">Рассчитать</button>
                `;
                break;
            case 'tiles':
                title = "Расчет плитки";
                content = `
                    <div class="form-group">
                        <label>Площадь поверхности (м²):</label>
                        <input type="number" id="tile-area" value="${savedWallArea || ''}" placeholder="0.0" step="0.1">
                        ${savedWallArea 
                            ? '<small style="color:green;">Подставлено из Геометрии</small>' 
                            : '<small style="color:#666;">(Возьмите из расчета Геометрии)</small>'}
                        ${(savedWallArea && savedFloorArea) ? `
                            <div style="margin-top: 5px;">
                                <button type="button"  class="btn-helper" 
                                    onclick="toggleAreaValue(this, 'tile-area', '${savedWallArea}', '${savedFloorArea}')">
                                    Использовать пол (${savedFloorArea} м²)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="form-group">
                        <label>Размер плитки (мм):</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="number" id="tile-w" placeholder="Ш" step="1" value="300">
                            <input type="number" id="tile-h" placeholder="В" step="1" value="300">
                        </div>
                        <div style="margin-top: 5px;">
                            <button type="button" class="btn-helper" onclick="setTileSize(300, 300)">30x30</button>
                            <button type="button" class="btn-helper" onclick="setTileSize(600, 600)">60x60</button>
                            <button type="button" class="btn-helper" onclick="setTileSize(600, 300)">60x30</button>
                        </div>
                        <small style="color:#666;">
                            Быстрый выбор популярных размеров
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Шов (мм):</label>
                        <input type="number" id="tile-grout" value="2" step="0.5">
                    </div>
                    <div class="form-group">
                        <label>Запас (%):</label>
                        <input type="number" id="tile-stock" value="10" step="1">
                        <small style="color: #666;">
                            Рекомендуется 5-15%
                        </small>
                    </div>

                    <div id="tiles-result" class="result-box" style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; display: none;">
                            <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculateTiles()">Рассчитать</button>
                `;
                break;
            case 'waterproofing':
                title = "Расчет гидроизоляции";
                content = `
                    <div class="form-group">
                        <label>Площадь обработки (м²):</label>
                        <input type="number" id="wp-area" value="${savedFloorArea || ''}" placeholder="0.0" step="0.1">
                        ${savedWallArea 
                            ? '<small style="color:green;">Подставлено из Геометрии</small>' 
                            : '<small style="color:#666;">(Возьмите из расчета Геометрии)</small>'}
                        ${(savedWallArea && savedFloorArea) ? `
                            <div style="margin-top: 5px;">
                                <button type="button"  class="btn-helper" 
                                    onclick="toggleAreaValue(this, 'wp-area', '${savedWallArea}', '${savedFloorArea}')">
                                    Использовать стены (${savedWallArea} м²)
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="form-group">
                        <label>Расход (кг/м²):</label>
                        <input type="number" id="wp-consumption" step="0.1" value="1.5">
                        <small style="color:#666;">Стандарт: 1.2 - 2.0 кг/м² (обычно на 2 слоя)</small>
                    </div>
                    <div class="form-group">
                        <label>Периметр стыков (м.п):</label>
                        <input type="number" id="wp-perimeter" value="${savedPerimeter || ''}" placeholder="0.0" step="0.1">
                        <small style="color:#666;">Для расчета ленты (уже подставлен периметр комнаты)</small>
                    </div>

                    <div id="wp-result" class="result-box" style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px; display: none;">
                            <!-- Результаты будут здесь -->
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="calculateWP()">Рассчитать</button>
                `;
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

//----------------------------------- РАСЧЕТЫ ---------------------------------------------

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

    // Сохраняем результат для других калькуляторов
    sessionStorage.setItem('lastNetWallArea', netWallArea);
    sessionStorage.setItem('lastFloorArea', floorArea);
    sessionStorage.setItem('lastPerimeter', perimeter.toFixed(2));
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

// Функция расчета краски или грунтовки
window.calculatePaint = function() {
    const area = parseFloat(document.getElementById('paint-area').value) || 0;
    const cons = parseFloat(document.getElementById('paint-consumption').value) || 0;
    const layers = parseInt(document.getElementById('paint-layers').value) || 1;

    if (area <= 0 || cons <= 0) {
        alert("Пожалуйста, заполните площадь и расход материала.");
        return;
    }

    // cons = м2/л
    const totalLiters = ((area / cons) * layers).toFixed(2);

    const resultBox = document.getElementById('paint-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Для покраски в ${layers} слоя(ев):</p>
        <p style="font-size:1.2rem; color:var(--accent-blue);">Необходимо: <strong>${totalLiters} л.</strong></p>
        <p style="font-size:0.9rem; margin-top:10px;">(Рекомендуем взять запас 10% - это примерно ${(totalLiters * 1.1).toFixed(2)} л.)</p>
    `;
};

// Функция расчета обоев
window.calculateWallpaper = function() {
    const area = parseFloat(document.getElementById('wallpaper-area').value) || 0;
    const rollWidth = parseFloat(document.getElementById('roll-width').value) || 0.53;
    const rollLength = parseInt(document.getElementById('roll-length').value) || 10.05;
    const wallHeight = parseInt(document.getElementById('wall-height').value) || 2.5;

    if (area <= 0 || wallHeight <= 0) {
        alert("Пожалуйста, введите площадь и высоту стен.");
        return;
    }

    // Общая длина стен
    const wallLength = area / wallHeight;

    // Сколько полос нужно
    const stripsNeeded = Math.ceil(wallLength / rollWidth);

    // Сколько полос в одном рулоне
    const stripsPerRoll = Math.floor(rollLength / wallHeight);

    // Кол-во рулонов
    const rollsNeeded =Math.ceil(stripsNeeded / stripsPerRoll);

    const resultBox = document.getElementById('wallpaper-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Полос нужно: <strong>${stripsNeeded}</strong></p>
        <p>Полос в рулоне: <strong>${stripsPerRoll}</strong></p>
        <p style="font-size:1.2rem; color:var(--accent-blue);">Необходимо рулонов: <strong>${rollsNeeded} шт.</strong></p>
        <p style="font-size:0.8rem; margin-top:10px; color:#666;">(Расчет без учета подгона рисунка. Рекомендуем взять +1 рулон в запас)</p>
    `;
};

// Функция расчета плитки
window.calculateTiles = function() {
    const area = parseFloat(document.getElementById('tile-area').value) || 0;
    const w = parseFloat(document.getElementById('tile-w').value) || 0;
    const h = parseFloat(document.getElementById('tile-h').value) || 0;
    const grout = parseFloat(document.getElementById('tile-grout').value) || 0;
    const stock = parseFloat(document.getElementById('tile-stock').value) || 0;

    if (area <= 0 || w <= 0 || h <= 0) {
        alert("Пожалуйста, введите площадь и размеры плитки.");
        return;
    }

    // Площадь плитки без шва
    const tileArea = (w * h) / 1000000;

    // Площадь плитки со швом (переводим из мм в метры)
    const tileAreaWithGrout = ((w + grout) * (h + grout)) / 1000000;

    // Кол-во плиток
    let count = area / tileAreaWithGrout;

    // Добавляем запас
    count = count * (1 + stock / 100);

    const finalCount = Math.ceil(count);

    const resultBox = document.getElementById('tiles-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Площадь плитки: <strong>${tileArea.toFixed(4)} м²</strong></p>
        <p>С учетом шва: <strong>${tileAreaWithGrout.toFixed(4)} м²</strong></p>
        <p style="font-size:1.2rem; color:var(--accent-blue);">Необходимо плиток: <strong>${finalCount} шт.</strong></p>
        <p style="font-size:0.8rem; margin-top:10px; color:#666;">(Шов: ${grout} мм, запас ${stock}%)</p>
        <p style="font-size:1.2rem; color:var(--accent-blue);">Общая площадь с запасом: ${(area * (1 + stock / 100)).toFixed(2)} м²</p>
    `;
};

// Функция-переключатель для площади (Стены <-> Пол)
window.toggleAreaValue = function(btn, inputId, wallArea, floorArea) {
    const input = document.getElementById(inputId);

    // Если стены, меняем на пол
    if (input.value === wallArea) {
        input.value = floorArea;
        btn.innerText = `Использовать стены (${wallArea} м²)`;
    } else {
        // Иначе меняем на пол
        input.value = wallArea;
        btn.innerText = `Использовать пол (${floorArea} м²)`;
    }
};

// Функция для быстрой установки размера плитки
window.setTileSize = function(w, h) {
    const inputW = document.getElementById('tile-w');
    const inputH = document.getElementById('tile-h');
    if (inputW && inputH) {
        inputW.value = w;
        inputH.value = h;
    }
};

// Функция расчета гидроизоляции
window.calculateWP = function() {
    const area = parseFloat(document.getElementById('wp-area').value) || 0;
    const cons = parseFloat(document.getElementById('wp-consumption').value) || 1.5;
    const perimeter = parseFloat(document.getElementById('wp-perimeter').value) || 0;

    if (area <= 0) {
        alert("Пожалуйста, введите площадь обработки.");
        return;
    }

    // Считаем общий вес мастики
    const totalWeight = area * cons;

    // Считаем ленту с запасом
    const tapeLength = Math.ceil(perimeter * 1.05);

    // Запас
    const areaWithReserve = area * 1.1;

    const resultBox = document.getElementById('wp-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Площадь с запасом: <strong>${areaWithReserve.toFixed(1)} м²</strong></p>
        <p>Мастика: <strong>${totalWeight.toFixed(1)} кг</strong></p>
        <p>Лента для углов: <strong>${tapeLength} м.п</strong></p>
        <hr style="margin: 10px 0; border: 0.5px solid #d0e7ff;">
        <p style="font-size:0.9rem; color: #666;">Рекомендуем купить: <br>
            - ${Math.ceil(totalWeight / 5)} ведер по 5 кг или ${Math.ceil(totalWeight / 15)} ведер по 15 кг.<br>
            - Ленты: рулоны по 10 или 20 метров.
        </p>
    `;
};