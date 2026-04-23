document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    // Очищаем старые ошибки
    errorDiv.classList.add('d-none');

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