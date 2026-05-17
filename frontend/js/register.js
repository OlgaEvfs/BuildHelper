document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorDisplay = document.getElementById('register-error');

    // ссылки на поля, чтобы менять классы
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Снимаем красную подсветку, когда пользователь начинает вводить текст
    [usernameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });

    // Проверка занятости email при потере фокуса
    emailInput.addEventListener('blur', async () => {
        const email = emailInput.value.trim();
        if (!email) return;

        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.exists) {
                emailInput.classList.add('is-invalid');
                errorDisplay.textContent = 'Этот email уже зарегистрирован.';
                errorDisplay.classList.remove('d-none');
            }
        } catch (err) {
            console.error('Ошибка проверки email:', err);
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Скрываем прошлые ошибки
            errorDisplay.classList.add('d-none');
            [usernameInput, emailInput, passwordInput].forEach(input => input.classList.remove('is-invalid'));

            // Собираем данные из полей (используем .trim() для удаления лишних пробелов)
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // ПРОВЕРКА
            let isInvalid = true;

            if (username.length < 3) {
                usernameInput.classList.add('is-invalid');
                isInvalid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailInput.classList.add('is-invalid');
                isInvalid = false;
            }

            const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
            if (!passwordRegex.test(password)) {
                passwordInput.classList.add('is-invalid');
                errorDisplay.textContent = 'Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру.';
                isInvalid = false;
            }

            // Если хоть одно поле неверно — прерываем выполнение и не идем в fetch
            if (!isInvalid) {
                errorDisplay.textContent = 'Пожалуйста, проверьте правильность заполнения полей.';
                errorDisplay.classList.remove('d-none');
                return;
            }

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
                    localStorage.setItem('userInfo', JSON.stringify(data));

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