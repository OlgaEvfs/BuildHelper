document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('login-error');

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });

    // Clear old errors
    errorDiv.classList.add('d-none');
    emailInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');

    // Get input values
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        errorDiv.textContent = 'Введите корректный формат Email';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Check for empty fields
    if (!email || !password) {
        if (!email) emailInput.classList.add('is-invalid');
        if (!password) passwordInput.classList.add('is-invalid');

        errorDiv.textContent = 'Пожалуйста, заполните все поля';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save data and redirect on success
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/';
        } else {
            // Show error message
            errorDiv.textContent = data.message || 'Ошибка входа';
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Login error:', err);
        errorDiv.textContent = 'Сервер недоступен. Попробуйте позже.';
        errorDiv.classList.remove('d-none');
    }
});