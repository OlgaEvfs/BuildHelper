document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorDisplay = document.getElementById('register-error');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Скрываем прошлые ошибки
            errorDisplay.classList.add('d-none');
            errorDisplay.textContent = '';

            // Собираем данные из полей
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Сохраняем токен и данные пользователя в localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userInfo', JSON.stringify({
                        username: data.username,
                        role: data.role
                    }));

                    // Показываем сообщение об успехе
                    const card = document.querySelector('.auth-card');
                    card.innerHTML = `
                        <div class="text-center py-4">
                            <div class="mb-3 text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            </div>
                            <h2 class="fw-bold">Регистрация прошла успешно!</h2>
                            <p class="text-muted">Рады вас видеть, ${data.username}!<br>Сейчас вы будете перенаправлены на главную.</p>
                        </div>
                    `

                    // Перенаправляем через 2 секунды
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 5000);
                } else {
                    // Показываем ошибку от сервера
                    errorDisplay.textContent = data.message || 'Ошибка регистрации';
                    errorDisplay.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Ошибка при регистрации:', error);
                errorDisplay.textContent = 'Не удалось связаться с сервером. Попробуйте позже.';
                errorDisplay.classList.remove('d-none');
            }
        });
    }
});