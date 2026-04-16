// функция для инициализации чек-листа
window.initChecklist = function() {
    const checkboxes = document.querySelectorAll('.check-item input');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');

    if (!checkboxes.length || !progressBar) return;

    // 1. Загружаем состояние из localStorage
    const savedState = JSON.parse(localStorage.getItem('repairChecklist')) || {};

    checkboxes.forEach(cb => {
        const id = cb.getAttribute('data-id');
        if (savedState[id]) {
            cb.checked = true;
        }

        // 2. Вешаем событие на изменение
        cb.addEventListener('change', () => {
            updateProgress();
            saveStateToLocal();
        });
    });

    // 3. Функция обновления прогресса
    function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('.check-item input:checked').length;
        const percentage = Math.round((checked / total) * 100);

        progressBar.style.width = percentage + '%';
        progressPercent.textContent = percentage + '%';
    }

    // 4. Сохраняем состояние в localStorage
    function saveStateToLocal() {
        const state = {};
        checkboxes.forEach(cb => {
            state[cb.getAttribute('data-id')] = cb.checked;
        });
        localStorage.setItem('repairChecklist', JSON.stringify(state));
    }

    // Инициализируем прогресс при загрузке
    updateProgress();
}