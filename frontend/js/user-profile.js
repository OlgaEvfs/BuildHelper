document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // если токена нет отправляем на логин
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    //------ ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ---------
    const menuLinks = document.querySelectorAll('.list-group-item[data-target]');
    const sections = document.querySelectorAll('section[id]');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // Убираем active у всех и добавляем нажатой
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Скрываем все секции и показываем нужную
            sections.forEach(s => s.classList.add('d-none'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('d-none');
            }

            // Если открыли расчеты - загрудаем их
            if (targetId === 'calculations-section') {
                loadUserCalculations();
            }
        });
    });
    //------------------------------------------------------

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

    // Функция загрузки расчетов
    async function loadUserCalculations() {
        const list = document.getElementById('calculations-list');

        try {
            const res = await fetch('/api/calculations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.length === 0) {
                list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Вы пока не сохранили ни одного расчета.</td></tr>';
                return;
            }

            list.innerHTML = data.map(calc => `
                <tr>
                    <td><span class="fw-bold text-dark">${calc.type}</span></td>
                    <td>${calc.result}</td>
                    <td class="small text-muted">${new Date(calc.createdAt).toLocaleDateString()}</td>
                    <td class="text-end">
                        <button class="btn btn-sm text-danger p-0 delete-calc-btn" data-id="${calc._id}" title="Удалить">&times;</button>
                    </td>
                </tr>
            `).join('');

            // Вешаем обработчики на кнопки удаления
            document.querySelectorAll('.delete-calc-btn').forEach(btn => {
                btn.onclick = () => deleteCalculation(btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Ошибка загрузки данных.</td></tr>';
        }
    }

    // Функция удаления расчета
    async function deleteCalculation(id) {
        if (!confirm('Удалить этот расчет из истории?')) return;

        try {
            const res = await fetch(`/api/calculations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                loadUserCalculations(); // Перезагружаем список
            }
        } catch (err) {
            alert('Не удалось удалить расчет.');
        }
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

