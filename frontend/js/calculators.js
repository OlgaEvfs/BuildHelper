// Вспомогательная функция для корректного парсинга чисел с запятой
function parseNumber(val) {
    if (typeof val === 'string') {
        return parseFloat(val.replace(',', '.'));
    }
    return parseFloat(val);
}

// Функция для открытия модалки калькулятора (теперь через Bootstrap)
window.openCalculatorModal = function(type) {
    const modalElement = document.getElementById('calcModal');
    const modalTitle = document.getElementById('calcModalTitle');
    const modalBody = document.getElementById('calcModalBody');

    if (!modalElement || !modalTitle || !modalBody) {
        console.error("Calculator modal elements not found in index.html");
        return;
    }

    // Достаем сохраненные данные в sessionStorage
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
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Длина (м):</label>
                    <input type="text" id="room-length" class="form-control" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Ширина (м):</label>
                    <input type="text" id="room-width" class="form-control" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Высота (м):</label>
                    <input type="text" id="room-height" class="form-control" placeholder="0.0">
                </div>
                
                <div id="openings-list">
                    <!-- Сюда будем добавлять двери и окна -->
                </div>
                <button class="btn btn-sm btn-outline-secondary mb-3" onclick="addOpeningRow()">+ Добавить проем</button>

                <div id="calc-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculateGeometry()">Рассчитать</button>
            `;
            break;

        case 'paint':
            title = "Расход грунтовки или краски";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь (м²):</label>
                    <div class="d-flex gap-2 mb-2">
                        <input type="text" id="paint-area" class="form-control" value="${savedWallArea || ''}" placeholder="0.0">
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('paint-area').value='${savedWallArea}'">Стены</button>
                            <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('paint-area').value='${savedFloorArea}'">Пол</button>
                        </div>
                    </div>
                    ${savedWallArea || savedFloorArea ? '<small class="text-success">Подставлено из Геометрии / 2D Планировщика</small>' : '<small class="text-muted">(Возьмите из расчета Геометрии)</small>'}
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Расход (м²/л):</label>
                    <input type="text" id="paint-consumption" class="form-control" placeholder="например 10">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Количество слоев:</label>
                    <input type="text" id="paint-layers" class="form-control" value="2">
                </div>

                <div id="paint-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculatePaint()">Рассчитать</button>
            `;
            break;
        
        case 'wallpaper':
            title = "Расчет обоев";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь стен (м²):</label>
                    <input type="text" id="wallpaper-area" class="form-control" value="${savedWallArea || ''}" placeholder="0.0">
                    ${savedWallArea ? '<small class="text-success">Подставлено из Геометрии / 2D Планировщика</small>' : ''}
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Ширина рулона (м):</label>
                    <select id="roll-width" class="form-select">
                        <option value="0.53">0.53 м (стандарт)</option>
                        <option value="1.06">1.06 м (метровые)</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Длина рулона (м):</label>
                    <select id="roll-length" class="form-select">
                        <option value="10.05">10.05 м (стандарт)</option>
                        <option value="25">25 м (проф)</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Высота стены (м):</label>
                    <input type="text" id="wall-height" class="form-control" value="2.5">
                </div>

                <div id="wallpaper-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculateWallpaper()">Рассчитать</button>
            `;
            break;

        case 'tiles':
            title = "Расчет плитки";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь поверхности (м²):</label>
                    <div class="d-flex gap-2 mb-2">
                        <input type="text" id="tile-area" class="form-control" value="${savedWallArea || ''}" placeholder="0.0">
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('tile-area').value='${savedWallArea}'">Стены</button>
                            <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('tile-area').value='${savedFloorArea}'">Пол</button>
                        </div>
                    </div>
                    ${savedWallArea || savedFloorArea ? '<small class="text-success">Подставлено из Геометрии / 2D Планировщика</small>' : ''}
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Размер плитки (мм):</label>
                    <div class="d-flex gap-2 mb-2">
                        <input type="text" id="tile-w" class="form-control" placeholder="Ш" value="300">
                        <input type="text" id="tile-h" class="form-control" placeholder="В" value="300">
                    </div>
                    <div class="btn-group btn-group-sm w-100">
                        <button type="button" class="btn btn-outline-secondary" onclick="setTileSize(300, 300)">30x30</button>
                        <button type="button" class="btn btn-outline-secondary" onclick="setTileSize(600, 600)">60x60</button>
                        <button type="button" class="btn btn-outline-secondary" onclick="setTileSize(600, 300)">60x30</button>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Шов (мм):</label>
                    <input type="text" id="tile-grout" class="form-control" value="2">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Запас (%):</label>
                    <input type="text" id="tile-stock" class="form-control" value="10">
                </div>

                <div id="tiles-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculateTiles()">Рассчитать</button>
            `;
            break;

        case 'waterproofing':
            title = "Расчет гидроизоляции";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь обработки (м²):</label>
                    <input type="text" id="wp-area" class="form-control" value="${savedFloorArea || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Расход (кг/м²):</label>
                    <input type="text" id="wp-consumption" class="form-control" value="1.5">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Периметр стыков (м.п):</label>
                    <input type="text" id="wp-perimeter" class="form-control" value="${savedPerimeter || ''}" placeholder="0.0">
                </div>

                <div id="wp-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculateWP()">Рассчитать</button>
            `;
            break;

        case 'floor':
            title = "Расчет стяжки пола";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь пола (м²):</label>
                    <input type="text" id="floor-area" class="form-control" value="${savedFloorArea || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Толщина слоя (см):</label>
                    <input type="text" id="floor-thickness" class="form-control" value="3">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Вес мешка (кг):</label>
                    <input type="text" id="bag-weight" class="form-control" value="25">
                </div>

                <div id="floor-result" class="result-box mb-3" style="display:none;"></div>

                <button class="btn bh-btn-primary w-100" onclick="calculateFloor()">Рассчитать</button>
            `;
            break;

        case 'drywall':
            title = "Расчет гипрока (ГКЛ)";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь поверхности (м²):</label>
                    <input type="text" id="drywall-area" class="form-control" value="${savedWallArea || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Размер листа:</label>
                    <select id="drywall-size" class="form-select">
                        <option value="3">1.2 x 2.5 м (3.0 м²)</option>
                        <option value="3.6">1.2 x 3.0 м (3.6 м²)</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Запас (%):</label>
                    <input type="text" id="drywall-stock" class="form-control" value="10">
                </div>
                <div id="drywall-result" class="result-box mb-3" style="display:none;"></div>
                <button class="btn bh-btn-primary w-100" onclick="calculateDrywall()">Рассчитать</button>
            `;
            break;

        case 'profiles':
            title = "Расчет профилей для ГКЛ";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь (м²):</label>
                    <input type="text" id="profile-area" class="form-control" value="${savedWallArea || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Периметр (м.п):</label>
                    <input type="text" id="profile-perimeter" class="form-control" value="${savedPerimeter || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Высота стены (м):</label>
                    <input type="text" id="profile-height" class="form-control" value="2.7">
                </div>
                <div id="profiles-result" class="result-box mb-3" style="display:none;"></div>
                <button class="btn bh-btn-primary w-100" onclick="calculateProfiles()">Рассчитать</button>
            `;
            break;

        case 'laminate':
            title = "Расчет ламината";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь пола (м²):</label>
                    <input type="text" id="laminate-area" class="form-control" value="${savedFloorArea || ''}" placeholder="0.0">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Упаковка (м²):</label>
                    <input type="text" id="laminate-pack" class="form-control" value="2.2">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Укладка:</label>
                    <select id="laminate-type" class="form-select">
                        <option value="5">Прямая (5%)</option>
                        <option value="12">Диагональная (12%)</option>
                    </select>
                </div>
                <div id="laminate-result" class="result-box mb-3" style="display:none;"></div>
                <button class="btn bh-btn-primary w-100" onclick="calculateLaminate()">Рассчитать</button>
            `;
            break;

        case 'bricks':
            title = "Расчет кирпича / блоков";
            content = `
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Площадь стен (м²):</label>
                    <input type="text" id="brick-area" class="form-control" value="${savedWallArea || ''}">
                </div>
                <div class="form-group mb-3">
                    <label class="form-label small fw-bold">Толщина стены (м):</label>
                    <input type="text" id="brick-wall-th" class="form-control" value="0.2">
                </div>
                <div id="bricks-result" class="result-box mb-3" style="display:none;"></div>
                <button class="btn bh-btn-primary w-100" onclick="calculateBricks()">Рассчитать</button>
            `;
            break;
    }

    // Заполняем модалку и открываем
    modalTitle.innerText = title;
    modalBody.innerHTML = content;

    const bsModal = new bootstrap.Modal(modalElement);
    bsModal.show();
}

//----------------------------------- РАСЧЕТЫ ---------------------------------------------

function showCalcError(boxId, message) {
    const resultBox = document.getElementById(boxId);
    if (!resultBox) return;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${message}</div>`;
}

window.calculateGeometry = function() {
    const length = parseNumber(document.getElementById('room-length').value);
    const width = parseNumber(document.getElementById('room-width').value);
    const height = parseNumber(document.getElementById('room-height').value);
    const resultBox = document.getElementById('calc-result');

    if (isNaN(length) || isNaN(width) || isNaN(height) || length <= 0 || width <= 0 || height <= 0) {
        showCalcError('calc-result', "Введите корректные размеры.");
        return;
    }

    const perimeter = (length + width) * 2;
    const floorArea = (length * width).toFixed(2);
    const grossWallArea = perimeter * height; 
    let totalOpeningsArea = 0;

    document.querySelectorAll('.opening-row').forEach(row => {
        const opW = parseNumber(row.querySelector('.op-width').value) || 0;
        const opH = parseNumber(row.querySelector('.op-height').value) || 0;
        const opQty = parseNumber(row.querySelector('.op-qty').value) || 1;
        totalOpeningsArea += (opW * opH * opQty);
    });

    const netWallArea = (grossWallArea - totalOpeningsArea).toFixed(2);

    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <div class="small">
            <p class="mb-1">Периметр: <strong>${perimeter.toFixed(2)} м.п.</strong></p>
            <p class="mb-1">Площадь пола: <strong>${floorArea} м²</strong></p>
            <p class="mb-0 text-primary">Чистая площадь стен: <strong>${netWallArea} м²</strong></p>
        </div>
        ${getSaveButtonHtml('Геометрия', `Стены: ${netWallArea} м², Пол: ${floorArea} м²`)}
    `;

    sessionStorage.setItem('lastNetWallArea', netWallArea);
    sessionStorage.setItem('lastFloorArea', floorArea);
    sessionStorage.setItem('lastPerimeter', perimeter.toFixed(2));
};

window.addOpeningRow = function() {
    const openingsList = document.getElementById('openings-list');
    const row = document.createElement('div');
    row.className = 'opening-row input-group input-group-sm mb-2';
    row.innerHTML = `
        <input type="text" class="form-control op-width" placeholder="Ш (м)">
        <input type="text" class="form-control op-height" placeholder="В (м)">
        <input type="text" class="form-control op-qty" placeholder="Кол" value="1">
        <button class="btn btn-outline-danger" onclick="this.parentElement.remove()">&times;</button>
    `;
    openingsList.appendChild(row);
};

window.calculatePaint = function() {
    const area = parseNumber(document.getElementById('paint-area').value);
    const cons = parseNumber(document.getElementById('paint-consumption').value);
    const layers = parseNumber(document.getElementById('paint-layers').value) || 1;
    const resultBox = document.getElementById('paint-result');

    if (isNaN(area) || isNaN(cons) || area <= 0 || cons <= 0) {
        showCalcError('paint-result', "Заполните площадь и расход.");
        return;
    }

    const totalLiters = ((area / cons) * layers).toFixed(2);
    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <p class="mb-0">Необходимо: <strong>${totalLiters} л.</strong></p>
        ${getSaveButtonHtml('Краска/Грунтовка', `${totalLiters} л.`)}
    `;
};

window.calculateWallpaper = function() {
    const area = parseNumber(document.getElementById('wallpaper-area').value);
    const rollWidth = parseNumber(document.getElementById('roll-width').value);
    const rollLength = parseNumber(document.getElementById('roll-length').value);
    const wallHeight = parseNumber(document.getElementById('wall-height').value);
    const resultBox = document.getElementById('wallpaper-result');

    if (isNaN(area) || isNaN(wallHeight) || area <= 0 || wallHeight <= 0) {
        showCalcError('wallpaper-result', "Введите площадь и высоту.");
        return;
    }

    const rollsNeeded = Math.ceil((area / wallHeight / rollWidth) / Math.floor(rollLength / wallHeight));
    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <p class="mb-0">Необходимо рулонов: <strong>${rollsNeeded} шт.</strong></p>
        ${getSaveButtonHtml('Обои', `${rollsNeeded} шт.`)}
    `;
};

window.calculateTiles = function() {
    const area = parseNumber(document.getElementById('tile-area').value);
    const w = parseNumber(document.getElementById('tile-w').value);
    const h = parseNumber(document.getElementById('tile-h').value);
    const grout = parseNumber(document.getElementById('tile-grout').value) || 0;
    const stock = parseNumber(document.getElementById('tile-stock').value) || 0;
    const resultBox = document.getElementById('tiles-result');

    if (isNaN(area) || isNaN(w) || isNaN(h)) {
        showCalcError('tiles-result', "Заполните все данные.");
        return;
    }

    const tileAreaWithGrout = ((w + grout) * (h + grout)) / 1000000;
    const finalCount = Math.ceil((area / tileAreaWithGrout) * (1 + stock / 100));

    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <p class="mb-0">Необходимо плиток: <strong>${finalCount} шт.</strong></p>
        ${getSaveButtonHtml('Плитка', `${finalCount} шт.`)}
    `;
};

window.setTileSize = function(w, h) {
    document.getElementById('tile-w').value = w;
    document.getElementById('tile-h').value = h;
};

window.calculateWP = function() {
    const area = parseNumber(document.getElementById('wp-area').value);
    const cons = parseNumber(document.getElementById('wp-consumption').value);
    const resultBox = document.getElementById('wp-result');

    if (isNaN(area) || isNaN(cons)) {
        showCalcError('wp-result', "Заполните данные.");
        return;
    }

    const totalWeight = (area * cons).toFixed(1);
    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <p class="mb-0">Мастика: <strong>${totalWeight} кг</strong></p>
        ${getSaveButtonHtml('Гидроизоляция', `${totalWeight} кг.`)}
    `;
};

window.calculateFloor = function() {
    const area = parseNumber(document.getElementById('floor-area').value);
    const thickness = parseNumber(document.getElementById('floor-thickness').value);
    const weight = parseNumber(document.getElementById('bag-weight').value) || 25;
    const resultBox = document.getElementById('floor-result');

    if (isNaN(area) || isNaN(thickness)) {
        showCalcError('floor-result', "Заполните данные.");
        return;
    }

    const bags = Math.ceil((area * thickness * 20 * 1.1) / weight);
    resultBox.style.display = 'block';
    resultBox.className = 'result-box alert alert-primary p-3 mb-3';
    resultBox.innerHTML = `
        <p class="mb-0">Необходимо мешков: <strong>${bags} шт.</strong></p>
        ${getSaveButtonHtml('Стяжка', `${bags} шт.`)}
    `;
};

function getSaveButtonHtml(calcName, resultValue) {
    if (localStorage.getItem('userInfo')) {
        return `<button class="btn btn-sm btn-success mt-2 w-100" onclick="saveCalculation(this, '${calcName}', '${resultValue}')">Сохранить в профиль</button>`;
    }
    return '';
}

window.saveCalculation = async function(btn, calcName, resultValue) {
    const userData = localStorage.getItem('userInfo');
    if (!userData) return showNotification('Войдите в систему.', 'warning');
    const { token } = JSON.parse(userData);

    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Сохранение...';

    try {
        const response = await fetch('/api/calculations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: calcName, result: resultValue })
        });
        if (response.ok) {
            showNotification(`Расчет "${calcName}" сохранен!`, 'success');
            btn.innerHTML = 'Сохранено!';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }, 2000);
        } else {
            showNotification('Ошибка связи с сервером.', 'danger');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    } catch (err) {
        showNotification('Ошибка связи с сервером.', 'danger');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
};