// frontend/js/planner.js

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('plan-info');
const propsBox = document.getElementById('object-props');
const roomApplyContainer = document.getElementById('room-apply-btn-container');

// Глобальное состояние
let rooms = [];      
let furniture = [];  
let openings = [];   
let selectedObject = null;
let isDragging = false;
let dragOffsetX, dragOffsetY;

let scale = 40; 

/**
 * Инициализация размеров холста под контейнер
 */
async function initCanvas() {
    const container = canvas.parentElement;
    if (!container) return;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    // Загружаем план с сервера при первой инициализации
    if (rooms.length === 0) {
        await loadPlanFromServer();
    }
    
    render();
}

/**
 * Загрузка плана из базы данных
 */
async function loadPlanFromServer() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/planner', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            rooms = data.rooms || [];
            furniture = data.furniture || [];
            openings = data.openings || [];
            renderOpeningsList();
        }
    } catch (err) {
        console.error('Ошибка загрузки плана:', err);
    }
}

/**
 * Сохранение плана в базу данных
 */
async function savePlanToServer() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему, чтобы сохранить проект.');
        return;
    }

    try {
        const response = await fetch('/api/planner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rooms, furniture, openings })
        });

        if (response.ok) {
            alert('Проект успешно сохранен в вашем профиле!');
        } else {
            alert('Ошибка при сохранении проекта.');
        }
    } catch (err) {
        console.error('Ошибка сохранения:', err);
        alert('Ошибка связи с сервером.');
    }
}

function addRoom() {
    const l = parseFloat(document.getElementById('plan-length').value) || 5;
    const w = parseFloat(document.getElementById('plan-width').value) || 4;
    const h = parseFloat(document.getElementById('plan-height')?.value) || 2.5;

    const newRoom = {
        type: 'room',
        x: 1, y: 1,
        l, w, h,
        name: rooms.length === 0 ? "Гостиная" : `Комната ${rooms.length + 1}`
    };
    rooms.push(newRoom);
    selectObject(newRoom);
    render();
}

function addFurniture(type, w, h) {
    const furnitureConfig = {
        sofa: { color: '#e67e22', name: 'Диван', icon: '🛋️' },
        bed: { color: '#9b59b6', name: 'Кровать', icon: '🛏️' },
        chair: { color: '#3498db', name: 'Кресло', icon: '🪑' },
        office_chair: { color: '#2980b9', name: 'Офисный стул', icon: '💺' },
        dining_chair: { color: '#7f8c8d', name: 'Стул', icon: '🪑' },
        table: { color: '#f1c40f', name: 'Стол', icon: '🍽️' },
        closet: { color: '#34495e', name: 'Шкаф', icon: '🚪' },
        kitchen: { color: '#d35400', name: 'Гарнитур', icon: '🍳' },
        fridge: { color: '#7f8c8d', name: 'Холодильник', icon: '❄️' },
        stove: { color: '#2c3e50', name: 'Плита', icon: '🔥' },
        bath: { color: '#3498db', name: 'Ванна', icon: '🛁' },
        toilet: { color: '#ecf0f1', name: 'Унитаз', icon: '🚽' },
        sink: { color: '#bdc3c7', name: 'Раковина', icon: '💧' },
        wash: { color: '#95a5a6', name: 'Стиралка', icon: '🧺' }
    };

    const config = furnitureConfig[type] || { color: '#3498db', name: type, icon: '📦' };

    const newItem = {
        type: 'furniture',
        furnitureType: type,
        w: w || 1, h: h || 1,
        x: 2, y: 2,
        rotation: 0,
        color: config.color,
        name: config.name,
        icon: config.icon
    };
    furniture.push(newItem);
    selectObject(newItem);
    render();
}

function selectObject(obj) {
    selectedObject = obj;
    if (!obj) {
        propsBox.classList.add('d-none');
        return;
    }
    propsBox.classList.remove('d-none');
    document.getElementById('prop-name').value = obj.name || obj.type;
    
    if (obj.type === 'room') {
        document.getElementById('prop-w').value = obj.l;
        document.getElementById('prop-l').value = obj.w;
        roomApplyContainer.classList.remove('d-none');
    } else {
        document.getElementById('prop-w').value = obj.w;
        document.getElementById('prop-l').value = obj.h;
        roomApplyContainer.classList.add('d-none');
    }
}

function updateObjectProps() {
    if (!selectedObject) return;
    selectedObject.name = document.getElementById('prop-name').value;
    const valW = parseFloat(document.getElementById('prop-w').value) || 0.1;
    const valL = parseFloat(document.getElementById('prop-l').value) || 0.1;
    if (selectedObject.type === 'room') {
        selectedObject.l = valW;
        selectedObject.w = valL;
    } else {
        selectedObject.w = valW;
        selectedObject.h = valL;
    }
    render();
}

function rotateObject() {
    if (!selectedObject || selectedObject.type !== 'furniture') return;
    const temp = selectedObject.w;
    selectedObject.w = selectedObject.h;
    selectedObject.h = temp;
    selectedObject.rotation = (selectedObject.rotation + 90) % 360;
    document.getElementById('prop-w').value = selectedObject.w;
    document.getElementById('prop-l').value = selectedObject.h;
    render();
}

function deleteObject() {
    if (!selectedObject) return;
    if (!confirm(`Удалить ${selectedObject.name}?`)) return;
    if (selectedObject.type === 'room') {
        rooms = rooms.filter(r => r !== selectedObject);
    } else {
        furniture = furniture.filter(f => f !== selectedObject);
    }
    selectObject(null);
    render();
}

function applySingleRoomToCalculators() {
    if (!selectedObject || selectedObject.type !== 'room') return;
    const floorArea = (selectedObject.l * selectedObject.w).toFixed(2);
    const perimeter = (2 * (selectedObject.l + selectedObject.w)).toFixed(2);
    const wallArea = (perimeter * selectedObject.h).toFixed(2);
    sessionStorage.setItem('lastNetWallArea', wallArea);
    sessionStorage.setItem('lastFloorArea', floorArea);
    sessionStorage.setItem('lastPerimeter', perimeter);
    alert(`Размеры комнаты "${selectedObject.name}" отправлены в калькуляторы!`);
}

function addOpening(type) {
    const w = type === 'door' ? 0.9 : 1.2;
    const h = type === 'door' ? 2.0 : 1.4;
    openings.push({ type, w, h });
    renderOpeningsList();
    updateInfo();
}

function removeOpening(index) {
    openings.splice(index, 1);
    renderOpeningsList();
    updateInfo();
}

function renderOpeningsList() {
    const list = document.getElementById('openings-list-planner');
    if (!list) return;
    list.innerHTML = openings.map((op, index) => `
        <div class="d-flex justify-content-between align-items-center bg-white border rounded p-1 mb-1 small">
            <span>${op.type === 'door' ? '🚪' : '🪟'} ${op.w}x${op.h}м</span>
            <button class="btn btn-sm text-danger p-0 px-1" onclick="removeOpening(${index})">&times;</button>
        </div>
    `).join('');
}

function clearPlanner() {
    if (!confirm('Очистить весь план?')) return;
    rooms = []; furniture = []; openings = [];
    selectObject(null);
    renderOpeningsList();
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlobalGrid();
    rooms.forEach(room => drawRoomObject(room));
    furniture.forEach(item => drawFurnitureObject(item));
    updateInfo();
}

function drawGlobalGrid() {
    ctx.strokeStyle = '#f1f1f1';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += scale) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += scale) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }
}

function drawRoomObject(room) {
    const rx = room.x * scale;
    const ry = room.y * scale;
    const rw = room.l * scale;
    const rh = room.w * scale;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = selectedObject === room ? '#e67e22' : '#2c3e50';
    ctx.lineWidth = selectedObject === room ? 4 : 8;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = '#34495e';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(room.name, rx + 10, ry + 20);
    ctx.font = '10px Arial';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText(`${room.l}м x ${room.w}м`, rx + 10, ry + 35);
}

function drawFurnitureObject(item) {
    const ix = item.x * scale;
    const iy = item.y * scale;
    const iw = item.w * scale;
    const ih = item.h * scale;
    ctx.fillStyle = item.color + 'CC';
    ctx.fillRect(ix, iy, iw, ih);
    ctx.strokeStyle = selectedObject === item ? '#ffffff' : '#2c3e50';
    ctx.lineWidth = selectedObject === item ? 3 : 1;
    ctx.strokeRect(ix, iy, iw, ih);
    const isLight = (item.color === '#ecf0f1' || item.color === '#bdc3c7' || item.color === '#f1c40f');
    ctx.fillStyle = isLight ? '#2c3e50' : '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon || '📦', ix + iw/2, iy + ih/2);
}

canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;
    let found = furniture.slice().reverse().find(f => mx > f.x && mx < f.x + f.w && my > f.y && my < f.y + f.h) ||
                rooms.slice().reverse().find(r => mx > r.x && mx < r.x + r.l && my > r.y && my < r.y + r.w);
    if (found) {
        selectObject(found);
        isDragging = true;
        dragOffsetX = mx - found.x;
        dragOffsetY = my - found.y;
        canvas.style.cursor = 'grabbing';
    } else {
        selectObject(null);
    }
    render();
};

canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top) / scale;
    if (isDragging && selectedObject) {
        let newX = mx - dragOffsetX;
        let newY = my - dragOffsetY;
        const objW = selectedObject.type === 'room' ? selectedObject.l : selectedObject.w;
        const objH = selectedObject.type === 'room' ? selectedObject.w : selectedObject.h;
        if (newX < 0) newX = 0;
        if (newX + objW > canvas.width / scale) newX = (canvas.width / scale) - objW;
        if (newY < 0) newY = 0;
        if (newY + objH > canvas.height / scale) newY = (canvas.height / scale) - objH;
        if (selectedObject.type === 'room') {
            const SNAP_THRESHOLD = 0.2;
            rooms.forEach(other => {
                if (other === selectedObject) return;
                if (Math.abs(newX - (other.x + other.l)) < SNAP_THRESHOLD) newX = other.x + other.l;
                if (Math.abs((newX + selectedObject.l) - other.x) < SNAP_THRESHOLD) newX = other.x - selectedObject.l;
                if (Math.abs(newX - other.x) < SNAP_THRESHOLD) newX = other.x;
                if (Math.abs(newY - (other.y + other.w)) < SNAP_THRESHOLD) newY = other.y + other.w;
                if (Math.abs((newY + selectedObject.w) - other.y) < SNAP_THRESHOLD) newY = other.y - selectedObject.w;
                if (Math.abs(newY - other.y) < SNAP_THRESHOLD) newY = other.y;
            });
            if (newX < 0) newX = 0;
            if (newX + selectedObject.l > canvas.width / scale) newX = (canvas.width / scale) - selectedObject.l;
            if (newY < 0) newY = 0;
            if (newY + selectedObject.w > canvas.height / scale) newY = (canvas.height / scale) - selectedObject.w;
        }
        selectedObject.x = newX;
        selectedObject.y = newY;
        render();
    } else {
        const hovered = furniture.find(f => mx > f.x && mx < f.x + f.w && my > f.y && my < f.y + f.h) ||
                        rooms.find(r => mx > r.x && mx < r.x + r.l && my > r.y && my < r.y + r.w);
        canvas.style.cursor = hovered ? 'move' : 'crosshair';
    }
};

canvas.onmouseup = () => { isDragging = false; canvas.style.cursor = 'crosshair'; };

function applyToCalculators() {
    if (rooms.length === 0) return;
    let totalFloorArea = 0, totalNetWallArea = 0, totalPerimeter = 0;
    const openingsArea = openings.reduce((sum, op) => sum + (op.w * op.h), 0);
    rooms.forEach(room => {
        totalFloorArea += room.l * room.w;
        totalPerimeter += 2 * (room.l + room.w);
        totalNetWallArea += 2 * (room.l + room.w) * room.h;
    });
    totalNetWallArea -= openingsArea;
    sessionStorage.setItem('lastNetWallArea', totalNetWallArea.toFixed(2));
    sessionStorage.setItem('lastFloorArea', totalFloorArea.toFixed(2));
    sessionStorage.setItem('lastPerimeter', totalPerimeter.toFixed(2));
    alert('Данные всей квартиры сохранены!');
}

function updateInfo() {
    if (rooms.length === 0) { infoBox.classList.add('d-none'); return; }
    const totalArea = rooms.reduce((sum, r) => sum + (r.l * r.w), 0).toFixed(2);
    infoBox.classList.remove('d-none');
    infoBox.innerHTML = `<div class="d-flex justify-content-between align-items-center flex-wrap gap-2"><div><div class="fw-bold">Общая площадь: ${totalArea} м²</div></div><button class="btn btn-sm btn-success" onclick="applyToCalculators()">Применить всё</button></div>`;
}

window.addEventListener('resize', initCanvas);
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    window.addRoom = addRoom;
    window.addFurniture = addFurniture;
    window.addOpening = addOpening;
    window.removeOpening = removeOpening;
    window.clearPlanner = clearPlanner;
    window.applyToCalculators = applyToCalculators;
    window.applySingleRoomToCalculators = applySingleRoomToCalculators;
    window.savePlanToServer = savePlanToServer;
    window.updateObjectProps = updateObjectProps;
    window.deleteObject = deleteObject;
    window.rotateObject = rotateObject;
});
