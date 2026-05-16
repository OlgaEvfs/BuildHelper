document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');
    const supportTableBody = document.getElementById('supportTableBody');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    const supportViewModal = new bootstrap.Modal(document.getElementById('supportViewModal'));
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const copyBtn = document.getElementById('copyPasswordBtn');

    let userToDelete = null;
    let currentSupportRequest = null;
    let allSupportRequests = [];
    let allContentItems = [];

    const API_URL = '/api/admin';
    const token = localStorage.getItem('token');

    // Проверка права доступа
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!token || currentUser.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

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
                        <button class="btn btn-outline-warning" onclick="toggleStatus(this, '${u._id}', '${u.status}')" title="Бан/Разбан" ${u.role === 'admin' || isMe ? 'disabled' : ''}>
                            <i class="fas fa-ban"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="resetPassword(this, '${u._id}')" title="Сброс пароля">
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

    window.toggleStatus = async (btn, id, currentStatus) => {
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
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
            else { btn.disabled = false; btn.innerHTML = originalHtml; }
        } catch (err) { showNotification('Ошибка сети', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
    };

    window.resetPassword = async (btn, id) => {
        if (!confirm('Сбросить пароль и выдать временный?')) return;
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
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
        } catch (err) { showNotification('Ошибка сети', 'danger'); }
        btn.disabled = false;
        btn.innerHTML = originalHtml;
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
        } catch (err) { showNotification('Ошибка при удалении', 'danger'); }
    });

    // --- УПРАВЛЕНИЕ ПОДДЕРЖКОЙ ---
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
                    <div class="small text-truncate clickable-message" style="max-width: 300px;" onclick="viewSupportDetail('${r._id}')">
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
                        <button class="btn btn-outline-success" onclick="toggleSupportStatus(this, '${r._id}', '${r.status}')" title="${r.status === 'open' ? 'Отметить решенной' : 'Вернуть в работу'}">
                            <i class="fas ${r.status === 'open' ? 'fa-check' : 'fa-undo'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteSupport(this, '${r._id}')" title="Удалить навсегда">
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

    window.toggleSupportStatus = async (btn, id, currentStatus) => {
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
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
                if (currentSupportRequest && currentSupportRequest._id === id) supportViewModal.hide();
                fetchSupport();
            }
        } catch (err) { alert('Ошибка при обновлении статуса'); }
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    };

    window.deleteSupport = async (btn, id) => {
        if (!confirm('Вы уверены?')) return;
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        try {
            const res = await fetch(`${API_URL}/support/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (currentSupportRequest && currentSupportRequest._id === id) supportViewModal.hide();
                fetchSupport();
                fetchStats();
            }
        } catch (err) { alert('Ошибка при удалении заявки'); }
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    };

    // --- УПРАВЛЕНИЕ КОНТЕНТОМ ---
    async function fetchContent() {
        try {
            const res = await fetch(`${API_URL}/content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            allContentItems = data;
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
            <tr class="${item.status === 'pending' ? 'table-warning' : ''}">
                <td class="ps-4">
                    <div class="fw-bold text-truncate" style="max-width: 250px;">${item.title}</div>
                    <div class="d-flex gap-2 align-items-center">
                        <span class="badge ${item.category === 'jobs' ? 'bg-warning text-dark' : 'bg-info'}">${item.category === 'jobs' ? 'Вакансия' : 'Новость'}</span>
                        <span class="badge ${item.status === 'published' ? 'bg-success' : 'bg-secondary'} small" style="font-size: 0.65rem;">
                            ${item.status === 'published' ? 'Опубликовано' : 'Ожидает'}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="small">${item.author ? item.author.username : '<span class="text-danger italic">Удален</span>'}</div>
                    <div class="text-muted small" style="font-size: 0.75rem;">${item.author ? item.author.email : ''}</div>
                </td>
                <td class="small text-muted">${new Date(item.createdAt).toLocaleDateString()}</td>
                <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm">
                        ${item.status === 'pending' ? `
                            <button class="btn btn-success" onclick="approvePost(this, '${item._id}')" title="Одобрить и опубликовать">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : `
                            <button class="btn btn-outline-secondary" onclick="unpublishPost(this, '${item._id}')" title="Снять с публикации">
                                <i class="fas fa-undo"></i>
                            </button>
                        `}
                        <button class="btn btn-sm btn-outline-primary" onclick="viewPostDetail('${item._id}')" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePost(this, '${item._id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.viewPostDetail = (id) => {
        const item = allContentItems.find(i => i._id === id);
        if (!item) return;
        
        document.getElementById('previewModalHeaderTitle').textContent = item.title;
        document.getElementById('previewModalContent').textContent = item.content;
        
        // Установка автора и даты
        document.getElementById('previewModalAuthor').textContent = item.author ? item.author.username : 'Неизвестен';
        document.getElementById('previewModalDate').textContent = new Date(item.createdAt).toLocaleDateString();

        // Логика категории
        const categoryEl = document.getElementById('previewModalCategory');
        if (item.category === 'jobs') {
            categoryEl.textContent = 'Вакансия';
            categoryEl.className = 'badge bg-warning text-dark mb-2';
        } else {
            categoryEl.textContent = 'Новость';
            categoryEl.className = 'badge bg-info mb-2';
        }
        
        // Кнопка Одобрить
        const approveBtn = document.getElementById('previewApproveBtn');
        if (item.status === 'pending') {
            approveBtn.classList.remove('d-none');
            approveBtn.onclick = async () => {
                const originalHtml = approveBtn.innerHTML;
                approveBtn.disabled = true;
                approveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
                try {
                    await approvePost(approveBtn, item._id);
                    previewModal.hide();
                } finally {
                    approveBtn.disabled = false;
                    approveBtn.innerHTML = originalHtml;
                }
            };
        } else {
            approveBtn.classList.add('d-none');
        }
        
        // Обработка изображения
        const img = document.getElementById('previewModalImage');
        const noImg = document.getElementById('previewModalNoImage');
        
        if (item.imageUrl) {
            img.src = item.imageUrl;
            img.classList.remove('d-none');
            noImg.classList.add('d-none');
            img.onerror = () => {
                img.classList.add('d-none');
                noImg.classList.remove('d-none');
            };
        } else {
            img.classList.add('d-none');
            noImg.classList.remove('d-none');
        }

        previewModal.show();
    };

    window.approvePost = async (btn, id) => {
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        try {
            const res = await fetch(`${API_URL}/content/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'published' })
            });
            if (res.ok) fetchContent();
        } catch (err) { showNotification('Ошибка', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
    };

    window.unpublishPost = async (btn, id) => {
        if (!confirm('Снять с публикации?')) return;
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        try {
            const res = await fetch(`${API_URL}/content/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'pending' })
            });
            if (res.ok) fetchContent();
        } catch (err) { showNotification('Ошибка', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
    };

    window.deletePost = async (btn, id) => {
        if (!confirm('Удалить навсегда?')) return;
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchContent();
                fetchStats();
            }
        } catch (err) { showNotification('Ошибка при удалении', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
    };

    // Слушатели для кнопок в модалке просмотра
    document.getElementById('supportStatusBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            toggleSupportStatus(supportStatusBtn, currentSupportRequest._id, currentSupportRequest.status);
        }
    });

    document.getElementById('supportDeleteBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            deleteSupport(supportDeleteBtn, currentSupportRequest._id);
        }
    });

    // --- ИНИЦИАЛИЗАЦИЯ ---
    document.getElementById('support-tab').addEventListener('click', fetchSupport);
    document.getElementById('users-tab').addEventListener('click', fetchUsers);
    document.getElementById('content-tab').addEventListener('click', fetchContent);

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

    fetchStats();
    fetchUsers();
    fetchSupport();
    fetchContent();
});