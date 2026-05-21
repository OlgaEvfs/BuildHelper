// Checklist initialization function
window.initChecklist = function() {
    const checkboxes = document.querySelectorAll('.check-item input');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');

    if (!checkboxes.length || !progressBar) return;

    // 1. Load state from localStorage
    const savedState = JSON.parse(localStorage.getItem('repairChecklist')) || {};

    // Hide registration reminder if user is logged in
    const regReminder = document.getElementById('reg-reminder');
    if (regReminder && localStorage.getItem('userInfo')) {
        regReminder.classList.add('d-none');
        regReminder.classList.remove('d-flex');
    }

    checkboxes.forEach(cb => {
        const id = cb.getAttribute('data-id');
        if (savedState[id]) {
            cb.checked = true;
        }

        // 2. Add change event listener
        cb.addEventListener('change', () => {
            updateProgress();
            saveStateToLocal();
        });
    });

    // 3. Progress update function
    function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll('.check-item input:checked').length;
        const percentage = Math.round((checked / total) * 100);

        progressBar.style.width = percentage + '%';
        progressPercent.textContent = percentage + '%';
    }

    // 4. Save state to localStorage
    function saveStateToLocal() {
        const state = {};
        checkboxes.forEach(cb => {
            state[cb.getAttribute('data-id')] = cb.checked;
        });
        localStorage.setItem('repairChecklist', JSON.stringify(state));
    }

    // Initialize progress on load
    updateProgress();
}