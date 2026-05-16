document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // если токена нет отправляем на логин
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Проверка необходимости смены пароля (временный пароль от админа)
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.resetPasswordRequired) {
        const resetAlert = document.getElementById('reset-password-alert');
        if (resetAlert) {
            resetAlert.classList.remove('d-none');
        }
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
            } else if (targetId === 'checklist-section') {
                loadUserChecklist();
            } else if (targetId === 'planner-section') {
                if (typeof initCanvas === 'function') setTimeout(initCanvas, 100);
            }
        });
    });

    // Обработка кнопок "Назад к профилю" внутри секций
    document.querySelectorAll('.back-to-profile').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const profileTab = document.querySelector('[data-target="profile-section"]');
            if (profileTab) profileTab.click(); // Просто имитируем клик по первой вкладке меню
        });
    });

    // --- УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ ---
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmModalBtn = document.getElementById('confirmModalBtn');
    let confirmCallback = null;

    window.showConfirm = (title, body, btnText, callback) => {
        document.getElementById('confirmModalTitle').textContent = title || 'Вы уверены?';
        document.getElementById('confirmModalBody').textContent = body || 'Это действие нельзя будет отменить.';
        confirmModalBtn.textContent = btnText || 'Удалить';
        confirmCallback = callback;
        confirmModal.show();
    };

    confirmModalBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        confirmModal.hide();
    });

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
            window.location.href = 'login.html';
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
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            
            // Блокируем кнопку
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Обновление...';

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

                    // Обновляем данные в localStorage, чтобы убрать уведомление
                    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    currentUser.resetPasswordRequired = false;
                    localStorage.setItem('userInfo', JSON.stringify(currentUser));

                    // Скрываем само уведомление
                    const resetAlert = document.getElementById('reset-password-alert');
                    if (resetAlert) resetAlert.classList.add('d-none');

                } else {
                    passwordMessage.textContent = data.message || 'Ошибка смены пароля';
                    passwordMessage.classList.add('alert-danger');
                }
            } catch (error) {
                passwordMessage.textContent = 'Ошибка соединения с сервером';
                passwordMessage.classList.add('alert-danger');
            } finally {
                // Возвращаем кнопку
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // --- ФУНКЦИИ ДЛЯ РАБОТЫ С ВАКАНСИЯМИ ---

    // Переменная для хранения списка всех вакансий пользователя
    let myJobs = [];

    async function loadMyJobs() {
        const list = document.getElementById('my-jobs-list');
        try {
            const res = await fetch('/api/news/my-jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            myJobs = await res.json();

            if (myJobs.length === 0) {
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

            list.innerHTML = myJobs.map(job => `
                <div class="card mb-3 border shadow-sm p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex gap-3">
                            <div class="bg-light rounded p-2 fs-3">${typeIcons[job.jobType] || '📋'}</div>
                            <div>
                                <h5 class="fw-bold mb-1">
                                    <a href="/news-detail.html?id=${job._id}" class="text-decoration-none text-dark hover-accent">${job.title}</a>
                                </h5>
                                <p class="small text-muted mb-2">${job.location || 'Локация не указана'} | ${new Date(job.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <span class="badge bh-bg-light text-dark mb-2">${getJobTypeName(job.jobType)}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-warning" onclick="openEditModal('${job._id}')">Редактировать</button>
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

    // Редактирование вакансий
    window.openEditModal = (id) => {
        const job = myJobs.find(j => j._id === id);
        if (!job) return;

        document.getElementById('edit-job-id').value = job._id;
        document.getElementById('edit-job-title').value = job.title;
        document.getElementById('edit-job-type').value = job.jobType;
        document.getElementById('edit-job-employment').value = job.employment;
        document.getElementById('edit-job-location').value = job.location;
        document.getElementById('edit-job-salary').value = job.salary;
        document.getElementById('edit-job-content').value = job.content;
        document.getElementById('edit-job-contact-name').value = job.contactName;
        document.getElementById('edit-job-contact-phone').value = job.contactPhone;
        document.getElementById('edit-job-contact-email').value = job.contactEmail;

        const modal = new bootstrap.Modal(document.getElementById('editJobModal'));
        modal.show();
    };

    const editJobForm = document.getElementById('edit-job-form');
    if (editJobForm) {
        editJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-job-id').value;
            const jobData = {
                title: document.getElementById('edit-job-title').value,
                jobType: document.getElementById('edit-job-type').value,
                employment: document.getElementById('edit-job-employment').value,
                location: document.getElementById('edit-job-location').value,
                salary: document.getElementById('edit-job-salary').value,
                content: document.getElementById('edit-job-content').value,
                contactName: document.getElementById('edit-job-contact-name').value,
                contactPhone: document.getElementById('edit-job-contact-phone').value,
                contactEmail: document.getElementById('edit-job-contact-email').value,
            };

            try {
                const res = await fetch(`/api/news/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                });

                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editJobModal'));
                    modal.hide();
                    loadMyJobs();
                    showNotification('Вакансия обновлена и отправлена на модерацию!', 'success');
                } else {
                    const err = await res.json();
                    alert(err.message || 'Ошибка обновления');
                }
            } catch (err) {
                alert('Ошибка сети');
            }
        });
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
            const submitBtn = addJobForm.querySelector('button[type="submit"]');
            
            // Блокируем кнопку
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Публикация...';
            
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
                    const isUser = userInfo.role !== 'admin';
                    msg.textContent = isUser 
                        ? 'Вакансия отправлена на модерацию и появится в ленте после проверки!' 
                        : 'Вакансия успешно опубликована!';
                    msg.className = 'alert alert-success mt-3';
                    msg.classList.remove('d-none');
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
                        modal.hide();
                        addJobForm.reset();
                        msg.classList.add('d-none');
                        // Возвращаем кнопку в исходное состояние
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        loadMyJobs();
                    }, 3000);
                } else {
                    const err = await res.json();
                    msg.textContent = err.message || 'Ошибка при создании';
                    msg.className = 'alert alert-danger mt-3';
                    msg.classList.remove('d-none');
                    // Возвращаем кнопку
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                msg.textContent = 'Ошибка сети';
                msg.className = 'alert alert-danger mt-3';
                msg.classList.remove('d-none');
                // Возвращаем кнопку
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    async function deleteJob(id) {
        showConfirm('Удалить вакансию?', 'Эта вакансия будет удалена навсегда.', 'Удалить', async () => {
            try {
                const res = await fetch(`/api/news/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) loadMyJobs();
            } catch (err) {
                showNotification('Не удалось удалить.', 'danger');
            }
        });
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
                    <td class="small text-muted">${new Date(calc.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td class="text-end">
                        <button class="btn btn-sm text-danger p-0 delete-calc-btn" data-id="${calc._id}" title="Удалить">&times;</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.delete-calc-btn').forEach(btn => {
                btn.onclick = () => deleteCalculation(btn, btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Ошибка загрузки данных.</td></tr>';
        }
    }

    async function deleteCalculation(btn, id) {
        showConfirm('Удалить расчет?', 'Этот расчет будет удален из вашей истории.', 'Удалить', async () => {
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
            try {
                const res = await fetch(`/api/calculations/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    showNotification('Расчет удален', 'success');
                    loadUserCalculations();
                } else {
                    showNotification('Не удалось удалить расчет.', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            } catch (err) {
                showNotification('Ошибка удаления', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        });
    }

    // ---------- ФУНКЦИИ ДЛЯ РАБОТЫ С ЧЕК-ЛИСТОМ ------------

    async function loadUserChecklist() {
        const container = document.getElementById('user-checklist-container');
        try {
            const res = await fetch('/api/checklist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tasks = await res.json();
            if (tasks.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-3">Ваш список задач пуст.</p>';
                updateChecklistProgress(0, 0);
                return;
            }

            container.innerHTML = tasks.map(task => `
                <div class="d-flex align-items-center justify-content-between p-2 task-item">
                    <label class="check-item">
                        <input class="task-checkbox" type="checkbox"
                            ${task.completed ? 'checked' : ''} data-id="${task._id}">
                        <span class="checkmark"></span>
                        <span class="item-text">${task.text}</span>
                    </label>
                    <button class="btn btn-sm text-danger delete-task-btn" data-id="${task._id}" title="Удалить">&times;</button>
                </div>
            `).join('');

            const completedCount = tasks.filter(t => t.completed).length;
            updateChecklistProgress(completedCount, tasks.length);

            document.querySelectorAll('.task-checkbox').forEach(cb => {
                cb.onchange = () => toggleTaskStatus(cb.getAttribute('data-id'));
            });

            document.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.onclick = () => deleteTask(btn.getAttribute('data-id'));
            });
        } catch (err) {
            container.innerHTML = '<p class="text-danger">Ошибка загрузки списка.</p>';
        }
    }

    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.onsubmit = async (e) => {
            e.preventDefault();
            const input = document.getElementById('task-input');
            const submitBtn = addTaskForm.querySelector('button[type="submit"]');
            const text = input.value.trim();
            
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

            try {
                const res = await fetch('/api/checklist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ text })
                });
                if (res.ok) {
                    input.value = '';
                    loadUserChecklist();
                }
            } catch (err) {
                showNotification('Не удалось добавить задачу', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        };
    }

    async function toggleTaskStatus(id) {
        try {
            await fetch(`/api/checklist/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadUserChecklist();
        } catch (err) {
            showNotification('Ошибка обновления', 'danger');
        }
    }

    async function deleteTask(id) {
        showConfirm('Удалить задачу?', 'Эта задача будет удалена из вашего списка.', 'Удалить', async () => {
            try {
                await fetch(`/api/checklist/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification('Задача удалена', 'success');
                loadUserChecklist();
            } catch (err) {
                showNotification('Ошибка удаления', 'danger');
            }
        });
    }

    function updateChecklistProgress(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        document.getElementById('checklist-progress-bar').style.width = percent + '%';
        document.getElementById('checklist-progress-text').textContent = percent + '%';
    }
});