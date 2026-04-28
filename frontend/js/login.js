document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('login-error');

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });

    // Очищаем старые ошибки
    errorDiv.classList.add('d-none');
    emailInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');

    // берем значения
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Проверяем на пустоту
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
            // Если ок - сохраняем данные и переходим на главную
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/';
        } else {
            // Если ошибка - показываем сообщение
            errorDiv.textContent = data.message || 'Ошибка входа';
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Login error:', err);
        errorDiv.textContent = 'Сервер недоступен. Попробуйте позже.';
        errorDiv.classList.remove('d-none');
    }
});