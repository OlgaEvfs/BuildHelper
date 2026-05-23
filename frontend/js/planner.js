// Parse numbers with comma decimal separator
function parseNumber(val) {
    if (typeof val === 'string') {
        return parseFloat(val.replace(',', '.'));
    }
    return parseFloat(val);
}

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('plan-info');
const propsBox = document.getElementById('object-props');
const roomApplyContainer = document.getElementById('room-apply-btn-container');

// Initialize global state
let rooms = [];      
let furniture = [];  
let openings = [];   
let selectedObject = null;
let isDragging = false;
let dragOffsetX, dragOffsetY;

let scale = 40; 

/**
 * Initialize canvas dimensions to container
 */
async function initCanvas() {
    const container = canvas.parentElement;
    if (!container) return;
    
    // Set minimum canvas dimensions
    const minWidth = window.innerWidth <= 768 ? 800 : container.offsetWidth;
    const minHeight = window.innerWidth <= 768 ? 600 : container.offsetHeight;
    
    canvas.width = Math.max(container.offsetWidth, minWidth);
    canvas.height = Math.max(container.offsetHeight, minHeight);
    
    // Set scale (e.g., 40 px = 1 meter)
    scale = 40; 
    
    // Load plan from server on first initialization
    if (rooms.length === 0) {
        await loadPlanFromServer();
    }
    
    render();
}

/**
 * Load plan from database
 */
async function savePlanToServer() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Пожалуйста, войдите в систему, чтобы сохранить проект.', 'warning');
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
            showNotification('Проект успешно сохранен в профиле!', 'success');
        } else {
            showNotification('Ошибка при сохранении проекта.', 'danger');
        }
    } catch (err) {
        console.error('Save error:', err);
        showNotification('Ошибка соединения с сервером.', 'danger');
    }
}

function addRoom() {
    const l = parseNumber(document.getElementById('plan-length').value) || 5;
    const w = parseNumber(document.getElementById('plan-width').value) || 4;
    const h = parseNumber(document.getElementById('plan-height')?.value) || 2.5;

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
        office_chair: { color: '#2980b9', name: 'Офисное кресло', icon: '💺' },
        dining_chair: { color: '#7f8c8d', name: 'Стул', icon: '🪑' },
        table: { color: '#f1c40f', name: 'Стол', icon: '🍽️' },
        closet: { color: '#34495e', name: 'Шкаф', icon: '🚪' },
        kitchen: { color: '#d35400', name: 'Кухонный гарнитур', icon: '🍳' },
        fridge: { color: '#7f8c8d', name: 'Холодильник', icon: '❄️' },
        stove: { color: '#2c3e50', name: 'Плита', icon: '🔥' },
        bath: { color: '#3498db', name: 'Ванна', icon: '🛁' },
        toilet: { color: '#ecf0f1', name: 'Унитаз', icon: '🚽' },
        sink: { color: '#bdc3c7', name: 'Раковина', icon: '💧' },
        wash: { color: '#95a5a6', name: 'Стиральная машина', icon: '🧺' }
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
    document.getElementById('prop-name').value = obj.name || (obj.type === 'door' ? 'Дверь' : obj.type === 'window' ? 'Окно' : obj.type);
    
    if (obj.type === 'room') {
        document.getElementById('prop-w').value = obj.l;
        document.getElementById('prop-l').value = obj.w;
        roomApplyContainer.classList.remove('d-none');
    } else if (obj.type === 'door' || obj.type === 'window') {
        document.getElementById('prop-w').value = obj.w;
        document.getElementById('prop-l').value = obj.h;
        roomApplyContainer.classList.add('d-none');
    } else {
        document.getElementById('prop-w').value = obj.w;
        document.getElementById('prop-l').value = obj.h;
        roomApplyContainer.classList.add('d-none');
    }
}

function updateObjectProps() {
    if (!selectedObject) return;
    selectedObject.name = document.getElementById('prop-name').value;
    const valW = parseNumber(document.getElementById('prop-w').value) || 0.1;
    const valL = parseNumber(document.getElementById('prop-l').value) || 0.1;
    if (selectedObject.type === 'room') {
        selectedObject.l = valW;
        selectedObject.w = valL;
    } else if (selectedObject.type === 'door' || selectedObject.type === 'window') {
        selectedObject.w = valW;
        selectedObject.h = valL;
        renderOpeningsList(); // Update list to display new dimensions
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
    
    window.showConfirmation(
        'Удаление',
        `Удалить ${selectedObject.name}?`,
        () => {
            if (selectedObject.type === 'room') {
                rooms = rooms.filter(r => r !== selectedObject);
            } else {
                furniture = furniture.filter(f => f !== selectedObject);
            }
            selectObject(null);
            render();
        },
        'Удалить'
    );
}

// ...

function renderOpeningsList() {
    const listContainer = document.getElementById('openings-list-planner');
    if (!listContainer) return;
    
    if (openings.length === 0) {
        listContainer.innerHTML = '<p class="small text-muted">Проемов нет</p>';
        return;
    }
    
    listContainer.innerHTML = openings.map((op, index) => {
        const room = rooms[op.roomId];
        const roomName = room ? room.name : 'Неизвестная комната';
        return `
            <div class="small p-1 border-bottom clickable-opening" onclick="selectOpening(${index})" style="cursor: pointer;">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${op.type === 'door' ? '🚪' : '🪟'} ${op.w}x${op.h}м</span>
                    <button class="btn btn-xs btn-outline-danger p-0 px-1" onclick="removeOpening(${index}); event.stopPropagation();">×</button>
                </div>
                <div class="text-muted" style="font-size: 0.7rem;">В: ${roomName}</div>
            </div>
        `;
    }).join('');
}

function selectOpening(index) {
    const op = openings[index];
    selectObject(op);
}

function addOpening(type) {
    if (!selectedObject || selectedObject.type !== 'room') {
        showNotification('Сначала выберите комнату!', 'warning');
        return;
    }
    const roomId = rooms.indexOf(selectedObject);
    const newOpening = {
        type: type,
        roomId: roomId,
        w: type === 'door' ? 0.9 : 1.2,
        h: type === 'door' ? 2.0 : 1.5
    };
    openings.push(newOpening);
    renderOpeningsList();
    render();
}

function removeOpening(index) {
    openings.splice(index, 1);
    renderOpeningsList();
    render();
}

function applySingleRoomToCalculators() {
    if (!selectedObject || selectedObject.type !== 'room') return;
    
    const room = selectedObject;
    const roomId = rooms.indexOf(room);
    
    // Filter openings for this room only
    const roomOpenings = openings.filter(op => op.roomId === roomId);
    const openingsArea = roomOpenings.reduce((sum, op) => sum + (op.w * op.h), 0);
    
    const floorArea = room.l * room.w;
    const perimeter = 2 * (room.l + room.w);
    const wallArea = (perimeter * room.h) - openingsArea;
    
    sessionStorage.setItem('lastNetWallArea', wallArea.toFixed(2));
    sessionStorage.setItem('lastFloorArea', floorArea.toFixed(2));
    sessionStorage.setItem('lastPerimeter', perimeter.toFixed(2));
    showNotification(`Данные комнаты "${room.name}" перенесены!`, 'success');
}

function clearPlanner() {
    window.showConfirmation(
        'Очистить',
        'Очистить весь план?',
        () => {
            rooms = []; furniture = []; openings = [];
            selectObject(null);
            renderOpeningsList();
            render();
        },
        'Очистить'
    );
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlobalGrid();
    rooms.forEach(room => drawRoomObject(room));
    furniture.forEach(item => drawFurnitureObject(item));
    // Openings not rendered visually
    updateInfo();
}


function drawGlobalGrid() {
    // Intermediate grid (0.5 meter)
    ctx.beginPath();
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += scale / 2) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let j = 0; j < canvas.height; j += scale / 2) {
        ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
    }
    ctx.stroke();

    // Main grid (1 meter)
    ctx.beginPath();
    ctx.strokeStyle = '#d0d0d0';
    for (let i = 0; i < canvas.width; i += scale) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let j = 0; j < canvas.height; j += scale) {
        ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
    }
    ctx.stroke();
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

// Mouse and Touch event support
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return {
        mx: (clientX - rect.left) / scale,
        my: (clientY - rect.top) / scale
    };
}

function handlePointerDown(e) {
    const { mx, my } = getPointerPos(e);
    let found = furniture.slice().reverse().find(f => mx > f.x && mx < f.x + f.w && my > f.y && my < f.y + f.h) ||
                rooms.slice().reverse().find(r => mx > r.x && mx < r.x + r.l && my > r.y && my < r.y + r.w);
    if (found) {
        selectObject(found);
        isDragging = true;
        dragOffsetX = mx - found.x;
        dragOffsetY = my - found.y;
        canvas.style.cursor = 'grabbing';
        // Prevent page scroll on touch
        if(e.type === 'touchstart') e.preventDefault();
    } else {
        selectObject(null);
    }
    render();
}

function handlePointerMove(e) {
    const { mx, my } = getPointerPos(e);

    if (isDragging && selectedObject) {
        if (e.cancelable) e.preventDefault(); // Prevent page scroll while dragging

        let newX = mx - dragOffsetX;
        let newY = my - dragOffsetY;
        const objW = selectedObject.type === 'room' ? selectedObject.l : selectedObject.w;
        const objH = selectedObject.type === 'room' ? selectedObject.w : selectedObject.h;

        // Basic canvas bounds
        if (newX < 0) newX = 0;
        if (newX + objW > canvas.width / scale) newX = (canvas.width / scale) - objW;
        if (newY < 0) newY = 0;
        if (newY + objH > canvas.height / scale) newY = (canvas.height / scale) - objH;

        const SNAP_THRESHOLD = 0.2;

        if (selectedObject.type === 'room') {
            // Room snapping logic
            rooms.forEach(other => {
                if (other === selectedObject) return;
                if (Math.abs(newX - (other.x + other.l)) < SNAP_THRESHOLD) newX = other.x + other.l;
                if (Math.abs((newX + selectedObject.l) - other.x) < SNAP_THRESHOLD) newX = other.x - selectedObject.l;
                if (Math.abs(newX - other.x) < SNAP_THRESHOLD) newX = other.x;
                if (Math.abs(newY - (other.y + other.w)) < SNAP_THRESHOLD) newY = other.y + other.w;
                if (Math.abs((newY + selectedObject.w) - other.y) < SNAP_THRESHOLD) newY = other.y - selectedObject.w;
                if (Math.abs(newY - other.y) < SNAP_THRESHOLD) newY = other.y;
            });
        } else if (selectedObject.type === 'furniture') {
            // Furniture snapping logic
            furniture.forEach(other => {
                if (other === selectedObject) return;

                // Snap X
                if (Math.abs(newX - (other.x + other.w)) < SNAP_THRESHOLD) newX = other.x + other.w;
                if (Math.abs((newX + objW) - other.x) < SNAP_THRESHOLD) newX = other.x - objW;
                // Snap Y
                if (Math.abs(newY - (other.y + other.h)) < SNAP_THRESHOLD) newY = other.y + other.h;
                if (Math.abs((newY + objH) - other.y) < SNAP_THRESHOLD) newY = other.y - objH;

                // Edge alignment
                if (Math.abs(newX - other.x) < SNAP_THRESHOLD) newX = other.x;
                if (Math.abs(newY - other.y) < SNAP_THRESHOLD) newY = other.y;
            })

            // Snap furniture to internal room walls
            rooms.forEach(room => {
                if (Math.abs(newX - room.x) < SNAP_THRESHOLD && newX >= room.x) newX = room.x;
                if (Math.abs((newX + objW) - (room.x + room.l)) < SNAP_THRESHOLD && (newX + objW) <= (room.x + room.l)) {
                    newX = room.x + room.l - objW;
                }
                if (Math.abs(newY - room.y) < SNAP_THRESHOLD && newY >= room.y) newY = room.y;
                if (Math.abs((newY + objH) - (room.y + room.w)) < SNAP_THRESHOLD && (newY + objH) <= (room.y + room.w)) {
                    newY = room.y + room.w - objH;
                }
            });
        }
        selectedObject.x = newX;
        selectedObject.y = newY;
        render();
    } else {
        const hovered = furniture.find(f => mx > f.x && mx < f.x + f.w && my > f.y && my < f.y + f.h) ||
                        rooms.find(r => mx > r.x && mx < r.x + r.l && my > r.y && my < r.y + r.w);
        canvas.style.cursor = hovered ? 'move' : 'crosshair';
    }
}

function handlePointerUp() { 
    isDragging = false; 
    canvas.style.cursor = 'crosshair'; 
}

// Remove old and set new universal handlers
canvas.onmousedown = null;
canvas.onmousemove = null;
canvas.onmouseup = null;

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
canvas.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseleave', handlePointerUp);

// Touch events
canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
canvas.addEventListener('touchend', handlePointerUp);
canvas.addEventListener('touchcancel', handlePointerUp);

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
    showNotification('Данные перенесены в калькуляторы!', 'success');
}

function updateInfo() {
    if (rooms.length === 0) { infoBox.classList.add('d-none'); return; }
    const totalArea = rooms.reduce((sum, r) => sum + (r.l * r.w), 0).toFixed(2);
    const totalWallArea = rooms.reduce((sum, r) => sum + (2 * (r.l + r.w) * r.h), 0).toFixed(2);
    infoBox.classList.remove('d-none');
    infoBox.innerHTML = `
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="small">
                <div class="fw-bold">Пол: ${totalArea} м²</div>
                <div class="fw-bold">Стены: ${totalWallArea} м²</div>
            </div>
            <button class="btn btn-sm btn-success" onclick="applyToCalculators()">Применить все</button>
        </div>`;
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
