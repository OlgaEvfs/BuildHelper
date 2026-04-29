document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // если токена нет отправляем на логин
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Загружаем данные профиля
    try {
        const response = await fetch('/api/auth/profile', {
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();

            // Заполняем поля на странице
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('user-name-side').textContent = user.username;

            // Ставим первую букву в кружок (аватар)
            document.getElementById('user-initials').textContent = user.username[0].toUpperCase();
        } else {
            // Если неверный токен
            localStorage.clear();
            window.location.href = '../login.html';
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }

    // Блок смены пароля
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordMessage = document.getElementById('password-message');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;

            try {
                const response = await fetch('/api/auth/updatepassword', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                const data = await response.json();

                passwordMessage.classList.remove('d-none', 'alert-danger', 'alert-success');

                if (response.ok) {
                    passwordMessage.textContent = 'Пароль успешно изменен!';
                    passwordMessage.classList.add('alert-success');
                    changePasswordForm.reset(); // очищаем форму
                } else {
                    passwordMessage.textContent = data.message || 'Ошибка смены пароля';
                    passwordMessage.classList.add('alert-danger');
                }
            } catch (error) {
                passwordMessage.textContent = 'Ошибка соединения с сервером';
                passwordMessage.classList.add('alert-danger');
            }
        });
    }

    // Выход
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }
});

