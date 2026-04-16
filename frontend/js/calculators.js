// Функция для открытия модалки
window.openCalculatorModal = function(type) {

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
                
                <div id="openings-list">
                    <!-- Сюда будем добавлять двери и окна -->
                </div>
                <button class="btn-helper" onclick="addOpeningRow()">+ Добавить проем</button>

                <div id="calc-result" class="result-box">
                    <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculateGeometry()">Рассчитать</button>
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

                <div id="paint-result" class="result-box">
                    <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculatePaint()">Рассчитать</button>
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
                    <select id="roll-width">
                        <option value="0.53">0.53 м (стандарт)</option>
                        <option value="1.06">1.06 м (метровые)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Длина рулона (м):</label>
                    <select id="roll-length">
                        <option value="10.05">10.05 м (стандарт)</option>
                        <option value="25">25 м (проф)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Высота стены (м):</label>
                    <input type="number" id="wall-height" value="2.5" step="0.1">
                    <small style="color:#666;">Высота влияет на количестсво полос</small>
                </div>

                <div id="wallpaper-result" class="result-box">
                        <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculateWallpaper()">Рассчитать</button>
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

                <div id="tiles-result" class="result-box">
                        <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculateTiles()">Рассчитать</button>
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

                <div id="wp-result" class="result-box">
                            <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculateWP()">Рассчитать</button>
            `;
            break;
        case 'floor':
            title = "Расчет стяжки пола";
            content = `
                <div class="form-group">
                    <label>Площадь пола (м²):</label>
                    <input type="number" id="floor-area" value="${savedFloorArea || ''}" placeholder="0.0" step="0.1">
                    ${savedFloorArea ? '<small style="color:green;">Подставлено из Геометрии</small>' : '<small style="color:#666;">(Возьмите из расчета Геометрии)</small>'}
                </div>
                <div class="form-group">
                    <label>Толщина слоя (см):</label>
                    <input type="number" id="floor-thickness" placeholder="например, 3" step="0.5" value="3">
                    <small style="color:#666;">Минимальная толщина - 3 см</small>
                </div>
                <div class="form-group">
                    <label>Вес мешка (кг):</label>
                    <input type="number" id="bag-weight" value="25" step="1">
                </div>

                <div id="floor-result" class="result-box">
                            <!-- Результаты будут здесь -->
                </div>

                <button class="btn bh-btn-primary btn-full" onclick="calculateFloor()">Рассчитать</button>
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

//----------------------------------- РАСЧЕТЫ ---------------------------------------------

// Функция для вывода ошибок
function showCalcError(boxId, message) {
    const resultBox = document.getElementById(boxId);
    resultBox.style.display = 'block';
    resultBox.innerHTML = `<p style="color: var(--error-red); font-weight: 600;">${message}</p>`;
}

// Функция расчета геометрии
window.calculateGeometry = function() {
    const length = parseFloat(document.getElementById('room-length').value);
    const width = parseFloat(document.getElementById('room-width').value);
    const height = parseFloat(document.getElementById('room-height').value);
    const resultBox = document.getElementById('calc-result');

    if (isNaN(length) || isNaN(width) || isNaN(height) || length <= 0 || width <= 0 || height <= 0) {
        showCalcError('calc-result', "Пожалуйста, введите корректные размеры комнаты.");
        return;
    }

    const perimeter = (length + width) * 2;
    const floorArea = (length * width).toFixed(2);
    const grossWallArea = perimeter * height; 

    let totalOpeningsArea = 0;
    const openingRows = document.querySelectorAll('.opening-row');

    openingRows.forEach(row => {
        const opW = parseFloat(row.querySelector('.op-width').value) || 0;
        const opH = parseFloat(row.querySelector('.op-height').value) || 0;
        const opQty = parseFloat(row.querySelector('.op-qty').value) || 1;
        totalOpeningsArea += (opW * opH * opQty);
    });

    if (totalOpeningsArea >= grossWallArea) {
        showCalcError('calc-result', "Площадь проемов не может быть больше площади стен!");
        return;
    }

    const netWallArea = (grossWallArea - totalOpeningsArea).toFixed(2);

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Периметр: <strong>${perimeter.toFixed(2)} м.п.</strong></p>
        <p>Площадь пола: <strong>${floorArea} м²</strong></p>
        <p>Сумма проемов: <strong>${totalOpeningsArea.toFixed(2)} м²</strong></p>
        <p style="color:var(--accent-blue); font-size:1.1rem;">Чистая площадь стен: <strong>${netWallArea} м²</strong></p>
    `;

    sessionStorage.setItem('lastNetWallArea', netWallArea);
    sessionStorage.setItem('lastFloorArea', floorArea);
    sessionStorage.setItem('lastPerimeter', perimeter.toFixed(2));
};

// Функция для добавления блока, чтобы вычитать оконные и дверные проемы
window.addOpeningRow = function() {
    const openingsList = document.getElementById('openings-list');
    const row = document.createElement('div');
    row.className = 'opening-row';

    row.innerHTML = `
        <select class="opening-type">
            <option value="door">Дверь</option>
            <option value="window">Окно</option>
        </select>
        <input type="number" class="op-width" placeholder="Ш (м)" step="0.1">
        <input type="number" class="op-height" placeholder="В (м)" step="0.1">
        <input type="number" class="op-qty" placeholder="Кол-во" value="1">
        <button onclick="this.parentElement.remove()" class="btn-remove-row">&times;</button>
    `;
    openingsList.appendChild(row);
};

// Функция расчета краски или грунтовки
window.calculatePaint = function() {
    const area = parseFloat(document.getElementById('paint-area').value);
    const cons = parseFloat(document.getElementById('paint-consumption').value);
    const layers = parseInt(document.getElementById('paint-layers').value) || 1;

    if (isNaN(area) || isNaN(cons) || area <= 0 || cons <= 0) {
        showCalcError('paint-result', "Пожалуйста, заполните площадь и расход материала.");
        return;
    }

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
    const area = parseFloat(document.getElementById('wallpaper-area').value);
    const rollWidth = parseFloat(document.getElementById('roll-width').value);
    const rollLength = parseFloat(document.getElementById('roll-length').value);
    const wallHeight = parseFloat(document.getElementById('wall-height').value);

    if (isNaN(area) || isNaN(wallHeight) || area <= 0 || wallHeight <= 0) {
        showCalcError('wallpaper-result', "Пожалуйста, введите площадь и высоту стен.");
        return;
    }

    const wallLength = area / wallHeight;
    const stripsNeeded = Math.ceil(wallLength / rollWidth);
    const stripsPerRoll = Math.floor(rollLength / wallHeight);
    
    if (stripsPerRoll <= 0) {
        showCalcError('wallpaper-result', "Высота стены больше длины рулона!");
        return;
    }

    const rollsNeeded = Math.ceil(stripsNeeded / stripsPerRoll);
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
    const area = parseFloat(document.getElementById('tile-area').value);
    const w = parseFloat(document.getElementById('tile-w').value);
    const h = parseFloat(document.getElementById('tile-h').value);
    const grout = parseFloat(document.getElementById('tile-grout').value) || 0;
    const stock = parseFloat(document.getElementById('tile-stock').value) || 0;

    if (isNaN(area) || isNaN(w) || isNaN(h) || area <= 0 || w <= 0 || h <= 0) {
        showCalcError('tiles-result', "Пожалуйста, введите площадь и размеры плитки.");
        return;
    }

    const tileArea = (w * h) / 1000000;
    const tileAreaWithGrout = ((w + grout) * (h + grout)) / 1000000;
    let count = area / tileAreaWithGrout;
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
    if (input.value === wallArea) {
        input.value = floorArea;
        btn.innerText = `Использовать стены (${wallArea} м²)`;
    } else {
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
    const area = parseFloat(document.getElementById('wp-area').value);
    const cons = parseFloat(document.getElementById('wp-consumption').value);
    const perimeter = parseFloat(document.getElementById('wp-perimeter').value) || 0;

    if (isNaN(area) || isNaN(cons) || area <= 0 || cons <= 0) {
        showCalcError('wp-result', "Пожалуйста, заполните площадь и расход материала.");
        return;
    }

    const totalWeight = area * cons;
    const tapeLength = Math.ceil(perimeter * 1.05);
    const areaWithReserve = area * 1.1;

    const resultBox = document.getElementById('wp-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Площадь с запасом: <strong>${areaWithReserve.toFixed(1)} м²</strong></p>
        <p>Мастика: <strong>${totalWeight.toFixed(1)} кг</strong></p>
        <p>Лента для углов: <strong>${tapeLength} м.п</strong></p>
        
        <p style="font-size:0.9rem; color: #666;">Рекомендуем купить: <br>
            - ${Math.ceil(totalWeight / 5)} ведер по 5 кг или ${Math.ceil(totalWeight / 15)} ведер по 15 кг.<br>
            - Ленты: рулоны по 10 или 20 метров.
        </p>
    `;
};

// Функция расчета стяжки пола
window.calculateFloor = function() {
    const area = parseFloat(document.getElementById('floor-area').value);
    const thickness = parseFloat(document.getElementById('floor-thickness').value);
    const weight = parseFloat(document.getElementById('bag-weight').value) || 25;

    if (isNaN(area) || isNaN(thickness) || area <= 0 || thickness <= 0) {
        showCalcError('floor-result', "Пожалуйста, введите площадь и толщину слоя.");
        return;
    }

    if (thickness < 3) {
        showCalcError('floor-result', "Минимальная толщина стяжки - 3 см");
        return;
    }

    const totalWeight = area * thickness * 20;
    const totalWithReserve = totalWeight * 1.1;
    const bags = Math.ceil(totalWithReserve / weight);

    const resultBox = document.getElementById('floor-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <p>Площадь: <strong>${area} м²</strong></p>
        <p>Слой стяжки: <strong>${thickness} см</strong></p>
        <p>Общий вес смеси: <strong>${totalWeight.toFixed(0)} кг</strong></p>
        <p>С учетом запаса: <strong>${totalWithReserve.toFixed(0)} кг</strong></p>
        
        <p style="font-size:1.2rem; color: var(--accent-blue);">Необходимо мешков (${weight} кг): <strong>${bags} шт</strong></p>
        <p style="font-size:0.8rem; margin-top:10px; color: #666;">(Расход: ~20 кг/м² на 1 см толщины)</p>
    `;
};