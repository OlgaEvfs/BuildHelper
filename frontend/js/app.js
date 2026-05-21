document.addEventListener('DOMContentLoaded', () => {
    // 1. Update navigation
    if (typeof updateNavbar === 'function') {
        updateNavbar();
    }

    // 2. Define global notification function
    window.showNotification = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} shadow-sm position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.style.minWidth = '250px';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // 2.1. Define global confirmation function
    window.showConfirmation = (title, message, onConfirm, btnText = 'Confirm') => {
        const modalEl = document.getElementById('confirmModal');
        if (!modalEl) {
            console.error('Modal #confirmModal not found');
            return;
        }
        
        // Use existing instance or create a new one
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        
        const titleEl = document.getElementById('confirmModalTitle');
        const bodyEl = document.getElementById('confirmModalBody');
        const confirmBtn = document.getElementById('confirmModalBtn');

        titleEl.textContent = title;
        bodyEl.textContent = message;
        confirmBtn.textContent = btnText;

        // Clear old event handlers and set new one
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            modal.hide();
        });

        modal.show();
    };

    // 3. Load news
    if (typeof fetchNews === 'function') {
        fetchNews();
    }

    // 3. Initialize checklist
    if (typeof initChecklist === 'function') {
        initChecklist();
    }

    // 4. Attach click event to calculator cards
    const cards = document.querySelectorAll('.calc-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-calc');
            if (typeof openCalculatorModal === 'function') {
                openCalculatorModal(type);
            }
        });
    });

    // 5. Initialize scroll-to-top button
    const btnUp = document.querySelector('.btn-up');
    if (btnUp) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btnUp.classList.add('show');
            } else {
                btnUp.classList.remove('show');
            }
        });

        btnUp.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Display calculators only for authorized users
    const authOnlyCalcs = document.querySelectorAll('.auth-only-calc');
    if (localStorage.getItem('userInfo')) {
        authOnlyCalcs.forEach(calc => {
            calc.style.display = 'block';
        });
    }
});