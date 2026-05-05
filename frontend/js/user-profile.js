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

            // Загружаем данные в зависимости от открытой вкладки
            if (targetId === 'calculations-section') {
                loadUserCalculations();
            } else if (targetId === 'jobs-section') {
                loadMyJobs();
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
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('user-name-side').textContent = user.username;
            document.getElementById('user-initials').textContent = user.username[0].toUpperCase();
        } else {
            localStorage.clear();
            window.location.href = '../login.html';
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }

    // Блок смены пароля
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const passwordMessage = document.getElementById('password-message');
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
                    changePasswordForm.reset();
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

    // --- ФУНКЦИИ ДЛЯ РАБОТЫ С ВАКАНСИЯМИ ---

    async function loadMyJobs() {
        const list = document.getElementById('my-jobs-list');
        try {
            const res = await fetch('/api/news/my-jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jobs = await res.json();

            if (jobs.length === 0) {
                list.innerHTML = '<p class="text-muted italic">У вас пока нет размещенных вакансий.</p>';
                return;
            }

            const typeIcons = {
                finishing: '🖌️',
                plumbing: '🚿',
                electrical: '⚡',
                masonry: '🧱',
                roofing: '🏠',
                hvac: '❄️',
                general: '🛠️'
            };

            list.innerHTML = jobs.map(job => `
                <div class="card mb-3 border shadow-sm p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex gap-3">
                            <div class="bg-light rounded p-2 fs-3">${typeIcons[job.jobType] || '📋'}</div>
                            <div>
                                <h5 class="fw-bold mb-1">
                                    <a href="/news-detail.html?id=${job._id}" class="text-decoration-none text-dark hover-accent">${job.title}</a>
                                </h5>
                                <p class="small text-muted mb-2">${job.location || 'Локация не указана'} | ${new Date(job.createdAt).toLocaleDateString()}</p>
                                <span class="badge bh-bg-light text-dark mb-2">${getJobTypeName(job.jobType)}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="/news-detail.html?id=${job._id}" class="btn btn-sm btn-outline-primary">Просмотр</a>
                            <button class="btn btn-sm btn-outline-danger delete-job-btn" data-id="${job._id}">Удалить</button>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.delete-job-btn').forEach(btn => {
                btn.onclick = () => deleteJob(btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<p class="text-danger">Ошибка загрузки вакансий.</p>';
        }
    }

    function getJobTypeName(type) {
        const types = {
            finishing: 'Отделка',
            plumbing: 'Сантехника',
            electrical: 'Электрика',
            masonry: 'Каменные работы',
            roofing: 'Кровля',
            hvac: 'Вентиляция',
            general: 'Общие работы'
        };
        return types[type] || type;
    }

    const addJobForm = document.getElementById('add-job-form');
    if (addJobForm) {
        addJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('job-form-message');
            
            const jobData = {
                title: document.getElementById('job-title').value,
                category: 'jobs',
                jobType: document.getElementById('job-type').value,
                employment: document.getElementById('job-employment').value,
                location: document.getElementById('job-location').value,
                salary: document.getElementById('job-salary').value,
                content: document.getElementById('job-content').value,
                contactName: document.getElementById('job-contact-name').value,
                contactPhone: document.getElementById('job-contact-phone').value,
                contactEmail: document.getElementById('job-contact-email').value,
            };

            try {
                const res = await fetch('/api/news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                });

                if (res.ok) {
                    msg.textContent = 'Вакансия успешно создана!';
                    msg.className = 'alert alert-success mt-3';
                    msg.classList.remove('d-none');
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
                        modal.hide();
                        addJobForm.reset();
                        msg.classList.add('d-none');
                        loadMyJobs();
                    }, 1500);
                } else {
                    const err = await res.json();
                    msg.textContent = err.message || 'Ошибка при создании';
                    msg.className = 'alert alert-danger mt-3';
                    msg.classList.remove('d-none');
                }
            } catch (error) {
                msg.textContent = 'Ошибка сети';
                msg.className = 'alert alert-danger mt-3';
                msg.classList.remove('d-none');
            }
        });
    }

    async function deleteJob(id) {
        if (!confirm('Удалить эту вакансию?')) return;
        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadMyJobs();
        } catch (err) {
            alert('Не удалось удалить.');
        }
    }

    // --- ФУНКЦИИ ДЛЯ РАБОТЫ С РАСЧЕТАМИ ---

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

            document.querySelectorAll('.delete-calc-btn').forEach(btn => {
                btn.onclick = () => deleteCalculation(btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Ошибка загрузки данных.</td></tr>';
        }
    }

    async function deleteCalculation(id) {
        if (!confirm('Удалить этот расчет из истории?')) return;
        try {
            const res = await fetch(`/api/calculations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) loadUserCalculations();
        } catch (err) {
            alert('Не удалось удалить расчет.');
        }
    }

    // --- ВЫХОД ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }
});