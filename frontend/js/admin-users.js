document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');
    const supportTableBody = document.getElementById('supportTableBody');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    const supportViewModal = new bootstrap.Modal(document.getElementById('supportViewModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const copyBtn = document.getElementById('copyPasswordBtn');

    let userToDelete = null;
    let currentSupportRequest = null;

    const API_URL = '/api/admin';
    const token = localStorage.getItem('token');

    // Проверка права доступа
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!token || currentUser.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // --- ОБЩИЕ ФУНКЦИИ ---

    async function fetchStats() {
        try {
            const res = await fetch(`${API_URL}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stats = await res.json();
            document.getElementById('stats-users').textContent = stats.users;
            document.getElementById('stats-news').textContent = stats.news;
            document.getElementById('stats-support').textContent = stats.support;
        } catch (err) { console.error('Ошибка статистики:', err); }
    }

    // --- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ---

    window.fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Ошибка доступа или сервера');
            const users = await res.json();
            renderUsers(users);
        } catch (err) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
        }
    };

    function renderUsers(users) {
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Пользователи не найдены</td></tr>`;
            return;
        }
        usersTableBody.innerHTML = users.map(u => {
            const isMe = u._id === currentUser._id;
            return `
            <tr class="user-row ${isMe ? 'table-light' : ''}">
                <td>
                    <div class="fw-bold">${u.username} ${isMe ? '<span class="badge bg-secondary ms-1">Это вы</span>' : ''}</div>
                    <div class="small text-muted">${u.email}</div>
                </td>
                <td>
                    ${u.role === 'admin' ? '<span class="badge bg-dark">Admin</span>' : '<span class="badge bg-light text-dark border">User</span>'}
                </td>
                <td>
                    <span class="badge ${u.status === 'active' ? 'bg-success' : 'bg-danger'}">
                        ${u.status === 'active' ? 'Активен' : 'Забанен'}
                    </span>
                </td>
                <td class="small text-muted">
                    ${new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning" onclick="toggleStatus('${u._id}', '${u.status}')" title="Бан/Разбан" ${u.role === 'admin' || isMe ? 'disabled' : ''}>
                            <i class="fas fa-ban"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="resetPassword('${u._id}')" title="Сброс пароля">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="openDeleteModal('${u._id}', '${u.username}')" title="Удалить" ${u.role === 'admin' || isMe ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    window.toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            const res = await fetch(`${API_URL}/users/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchUsers();
        } catch (err) { alert('Ошибка сети'); }
    };

    window.resetPassword = async (id) => {
        if (!confirm('Сбросить пароль и выдать временный?')) return;
        try {
            const res = await fetch(`${API_URL}/users/${id}/reset-password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById('tempPasswordInput').textContent = data.tempPassword;
                passwordModal.show();
            }
        } catch (err) { alert('Ошибка сети'); }
    };

    window.openDeleteModal = (id, name) => {
        userToDelete = id;
        document.getElementById('deleteUserName').textContent = name;
        deleteModal.show();
    };

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`${API_URL}/users/${userToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                deleteModal.hide();
                fetchUsers();
                fetchStats();
            }
        } catch (err) { alert('Ошибка при удалении'); }
    });

    // --- УПРАВЛЕНИЕ ПОДДЕРЖКОЙ ---

    let allSupportRequests = []; // Храним локально для быстрого доступа

    async function fetchSupport() {
        try {
            const res = await fetch(`${API_URL}/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            allSupportRequests = data;
            renderSupport(data);
        } catch (err) { console.error('Ошибка поддержки:', err); }
    }

    function renderSupport(requests) {
        if (requests.length === 0) {
            supportTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Новых заявок нет</td></tr>`;
            return;
        }
        supportTableBody.innerHTML = requests.map(r => `
            <tr class="${r.status === 'resolved' ? 'opacity-50' : ''}">
                <td>
                    <div class="fw-bold">${r.subject || 'Без темы'}</div>
                    <div class="small text-muted">${r.name}</div>
                </td>
                <td>
                    <div class="small text-truncate cursor-pointer" style="max-width: 300px;" onclick="viewSupportDetail('${r._id}')">
                        ${r.message}
                    </div>
                </td>
                <td class="small text-muted">
                    ${new Date(r.createdAt).toLocaleDateString()}
                    <div class="badge ${r.status === 'resolved' ? 'bg-success' : 'bg-warning text-dark'} d-block mt-1">
                        ${r.status === 'resolved' ? 'Решено' : 'В работе'}
                    </div>
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewSupportDetail('${r._id}')" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="toggleSupportStatus('${r._id}', '${r.status}')" title="${r.status === 'open' ? 'Отметить решенной' : 'Вернуть в работу'}">
                            <i class="fas ${r.status === 'open' ? 'fa-check' : 'fa-undo'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteSupport('${r._id}')" title="Удалить навсегда">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.viewSupportDetail = (id) => {
        const req = allSupportRequests.find(r => r._id === id);
        if (!req) return;
        
        currentSupportRequest = req;
        
        document.getElementById('supportViewSubject').textContent = req.subject || 'Без темы';
        document.getElementById('supportViewName').textContent = req.name;
        document.getElementById('supportViewEmail').textContent = req.email;
        document.getElementById('supportViewEmail').href = `mailto:${req.email}`;
        document.getElementById('supportViewMessage').textContent = req.message;
        
        const statusBtn = document.getElementById('supportStatusBtn');
        if (req.status === 'open') {
            statusBtn.textContent = 'Завершить заявку';
            statusBtn.className = 'btn bh-btn-primary';
        } else {
            statusBtn.textContent = 'Вернуть в работу';
            statusBtn.className = 'btn btn-warning';
        }
        
        supportViewModal.show();
    };

    window.toggleSupportStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
        try {
            const res = await fetch(`${API_URL}/support/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                if (currentSupportRequest && currentSupportRequest._id === id) {
                    supportViewModal.hide();
                }
                fetchSupport();
            }
        } catch (err) { alert('Ошибка при обновлении статуса'); }
    };

    window.deleteSupport = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить эту заявку безвозвратно?')) return;
        try {
            const res = await fetch(`${API_URL}/support/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (currentSupportRequest && currentSupportRequest._id === id) {
                    supportViewModal.hide();
                }
                fetchSupport();
                fetchStats();
            }
        } catch (err) { alert('Ошибка при удалении заявки'); }
    };

    // --- УПРАВЛЕНИЕ КОНТЕНТОМ ---

    async function fetchContent() {
        try {
            const res = await fetch(`${API_URL}/content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            renderContent(data);
        } catch (err) { console.error('Ошибка контента:', err); }
    }

    function renderContent(items) {
        const container = document.getElementById('contentTableBody');
        if (items.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center py-4">Записей нет</td></tr>`;
            return;
        }
        container.innerHTML = items.map(item => `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold text-truncate" style="max-width: 250px;">${item.title}</div>
                    <span class="badge ${item.category === 'news' ? 'bg-info' : 'bg-warning text-dark'}">${item.category === 'news' ? 'Новость' : 'Вакансия'}</span>
                </td>
                <td>
                    <div class="small">${item.author ? item.author.username : '<span class="text-danger italic">Удален</span>'}</div>
                    <div class="text-muted small" style="font-size: 0.75rem;">${item.author ? item.author.email : ''}</div>
                </td>
                <td class="small text-muted">${new Date(item.createdAt).toLocaleDateString()}</td>
                <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm">
                        <a href="/news-detail.html?id=${item._id}" class="btn btn-outline-primary" target="_blank" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn btn-outline-danger" onclick="deletePost('${item._id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.deletePost = async (id) => {
        if (!confirm('Удалить эту запись безвозвратно?')) return;
        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchContent();
                fetchStats();
            }
        } catch (err) { alert('Ошибка при удалении'); }
    };

    // Слушатели для кнопок в модалке просмотра
    document.getElementById('supportStatusBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            toggleSupportStatus(currentSupportRequest._id, currentSupportRequest.status);
        }
    });

    document.getElementById('supportDeleteBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            deleteSupport(currentSupportRequest._id);
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ ---

    // Загружаем данные при переключении вкладок
    document.getElementById('support-tab').addEventListener('click', fetchSupport);
    document.getElementById('users-tab').addEventListener('click', fetchUsers);
    document.getElementById('content-tab').addEventListener('click', fetchContent);

    // Копирование пароля
    copyBtn.addEventListener('click', () => {
        const passwordText = document.getElementById('tempPasswordInput').textContent;
        navigator.clipboard.writeText(passwordText).then(() => {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check fs-5"></i>';
            copyBtn.classList.replace('btn-outline-primary', 'btn-success');
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                copyBtn.classList.replace('btn-success', 'btn-outline-primary');
            }, 2000);
        });
    });

    // Стартовая загрузка
    fetchStats();
    fetchUsers();
});