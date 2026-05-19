const API_URL = '/api/admin';
const token = localStorage.getItem('token');
let userToDelete = null;
let currentSupportRequest = null;
let allSupportRequests = [];
let allContentItems = [];

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
        document.getElementById('usersTableBody').innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
};

function renderUsers(users) {
    const usersTableBody = document.getElementById('usersTableBody');
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        if (res.ok) window.fetchUsers();
        else { btn.disabled = false; btn.innerHTML = originalHtml; }
    } catch (err) { showNotification('Ошибка сети', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
};

window.resetPassword = async (btn, id) => {
    window.showConfirmation('Сброс пароля', 'Сбросить пароль и выдать временный?', async () => {
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
                bootstrap.Modal.getInstance(document.getElementById('passwordModal')).show();
            }
        } catch (err) { showNotification('Ошибка сети', 'danger'); }
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }, 'Сбросить');
};

window.openDeleteModal = (id, name) => {
    window.showConfirmation('Подтверждение удаления', `Пользователь ${name} будет удален безвозвратно вместе со всеми его комментариями, новостями и расчетами.`, async () => {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                window.fetchUsers();
                fetchStats();
            }
        } catch (err) { showNotification('Ошибка при удалении', 'danger'); }
    }, 'Удалить всё');
};

// --- УПРАВЛЕНИЕ ПОДДЕРЖКОЙ ---
window.fetchSupport = async () => {
    try {
        const res = await fetch(`${API_URL}/support`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        allSupportRequests = data;
        renderSupport(data);
    } catch (err) { console.error('Ошибка поддержки:', err); }
};

function renderSupport(requests) {
    const supportTableBody = document.getElementById('supportTableBody');
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
    bootstrap.Modal.getInstance(document.getElementById('supportViewModal')).show();
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
            if (currentSupportRequest && currentSupportRequest._id === id) bootstrap.Modal.getInstance(document.getElementById('supportViewModal')).hide();
            window.fetchSupport();
        }
    } catch (err) { alert('Ошибка при обновлении статуса'); }
    btn.disabled = false;
    btn.innerHTML = originalHtml;
};

window.deleteSupport = async (btn, id) => {
    window.showConfirmation('Удаление заявки', 'Вы уверены, что хотите удалить эту заявку?', async () => {
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
        try {
            const res = await fetch(`${API_URL}/support/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (currentSupportRequest && currentSupportRequest._id === id) bootstrap.Modal.getInstance(document.getElementById('supportViewModal')).hide();
                window.fetchSupport();
                fetchStats();
            }
        } catch (err) { alert('Ошибка при удалении заявки'); }
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }, 'Удалить');
};

// --- УПРАВЛЕНИЕ КОНТЕНТОМ ---
window.fetchContent = async () => {
    try {
        const res = await fetch(`${API_URL}/content`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        allContentItems = data;
        renderContent(data);
    } catch (err) { console.error('Ошибка контента:', err); }
};

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
                    <button class="btn btn-sm btn-outline-warning" onclick="editPost('${item._id}')" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePost(this, '${item._id}')" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.editPost = (id) => {
    const item = allContentItems.find(i => i._id === id);
    if (!item) return;

    document.getElementById('edit-post-id').value = item._id;
    document.getElementById('edit-post-title').value = item.title;
    document.getElementById('edit-post-content').value = item.content;
    document.getElementById('edit-post-category').value = item.category;
    document.getElementById('edit-post-image').value = item.imageUrl || '';

    const jobFields = document.getElementById('edit-job-fields-wrapper');
    if (item.category === 'jobs') {
        jobFields.classList.remove('d-none');
        document.getElementById('edit-job-type').value = item.jobType || 'general';
        document.getElementById('edit-job-employment').value = item.employment || 'Полная занятость';
        document.getElementById('edit-job-location').value = item.location || '';
        document.getElementById('edit-job-salary').value = item.salary || '';
        document.getElementById('edit-job-contact-name').value = item.contactName || '';
        document.getElementById('edit-job-contact-phone').value = item.contactPhone || '';
        document.getElementById('edit-job-contact-email').value = item.contactEmail || '';
    } else {
        jobFields.classList.add('d-none');
    }

    new bootstrap.Modal(document.getElementById('editPostModal')).show();
};

window.viewPostDetail = (id) => {
    const item = allContentItems.find(i => i._id === id);
    if (!item) return;
    
    const previewModal = bootstrap.Modal.getInstance(document.getElementById('previewModal'));
    const previewDeleteBtn = document.getElementById('previewDeleteBtn');
    if (previewDeleteBtn) {
        previewDeleteBtn.disabled = false;
        previewDeleteBtn.innerHTML = 'Удалить';
    }

    document.getElementById('previewModalHeaderTitle').textContent = item.title;
    document.getElementById('previewModalContent').textContent = item.content;
    
    document.getElementById('previewModalAuthor').textContent = item.author ? item.author.username : 'Неизвестен';
    document.getElementById('previewModalDate').textContent = new Date(item.createdAt).toLocaleDateString();

    const categoryEl = document.getElementById('previewModalCategory');
    if (item.category === 'jobs') {
        categoryEl.textContent = 'Вакансия';
        categoryEl.className = 'badge bg-warning text-dark mb-2';
    } else {
        categoryEl.textContent = 'Новость';
        categoryEl.className = 'badge bg-info mb-2';
    }
    
    const approveBtn = document.getElementById('previewApproveBtn');
    if (item.status === 'pending') {
        approveBtn.classList.remove('d-none');
        approveBtn.onclick = async () => {
            const originalHtml = approveBtn.innerHTML;
            approveBtn.disabled = true;
            approveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
            try {
                await window.approvePost(approveBtn, item._id);
                previewModal.hide();
            } finally {
                approveBtn.disabled = false;
                approveBtn.innerHTML = originalHtml;
            }
        };
    } else {
        approveBtn.classList.add('d-none');
    }

    if (previewDeleteBtn) {
        previewDeleteBtn.onclick = async () => {
            await window.deletePost(previewDeleteBtn, item._id);
            previewModal.hide();
        };
    }
    
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
        if (res.ok) window.fetchContent();
    } catch (err) { showNotification('Ошибка', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
};

window.unpublishPost = async (btn, id) => {
    window.showConfirmation('Снятие с публикации', 'Вы уверены, что хотите снять запись с публикации?', async () => {
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
            if (res.ok) window.fetchContent();
        } catch (err) { showNotification('Ошибка', 'danger'); btn.disabled = false; btn.innerHTML = originalHtml; }
    }, 'Снять');
};

window.deletePost = async (btn, id) => {
    window.showConfirmation(
        'Подтверждение удаления',
        'Вы уверены, что хотите удалить эту запись? Это действие нельзя будет отменить.',
        async () => {
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
            try {
                const res = await fetch(`${API_URL}/content/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    showNotification('Запись успешно удалена!');
                    window.fetchContent();
                    fetchStats();
                } else {
                    throw new Error('Ошибка при удалении');
                }
            } catch (err) {
                showNotification('Ошибка при удалении', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        },
        'Удалить'
    );
};

// --- DOM INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Проверка права доступа
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!token || currentUser.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Инициализация модалок
    new bootstrap.Modal(document.getElementById('passwordModal'));
    new bootstrap.Modal(document.getElementById('supportViewModal'));
    new bootstrap.Modal(document.getElementById('previewModal'));

    // ЛОГИКА СОЗДАНИЯ ПОСТА
    function toggleJobFields() {
        const categorySelect = document.getElementById('post-category');
        const jobFields = document.getElementById('job-fields-wrapper');
        if (categorySelect && jobFields) {
            if (categorySelect.value === 'jobs') {
                jobFields.classList.remove('d-none');
                document.getElementById('job-contact-phone').required = true;
            } else {
                jobFields.classList.add('d-none');
                document.getElementById('job-contact-phone').required = false;
            }
        }
    }
    document.getElementById('post-category').addEventListener('change', toggleJobFields);

    // ЛОГИКА РЕДАКТИРОВАНИЯ ПОСТА
    function toggleEditJobFields() {
        const categorySelect = document.getElementById('edit-post-category');
        const jobFields = document.getElementById('edit-job-fields-wrapper');
        if (categorySelect && jobFields) {
            if (categorySelect.value === 'jobs') {
                jobFields.classList.remove('d-none');
                document.getElementById('edit-job-contact-phone').required = true;
            } else {
                jobFields.classList.add('d-none');
                document.getElementById('edit-job-contact-phone').required = false;
            }
        }
    }
    document.getElementById('edit-post-category').addEventListener('change', toggleEditJobFields);

    document.getElementById('edit-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-post-id').value;
        const msg = document.getElementById('edit-post-form-message');
        const submitBtn = document.getElementById('edit-post-form').querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Сохранение...';
        
        const category = document.getElementById('edit-post-category').value;
        const postData = {
            title: document.getElementById('edit-post-title').value,
            content: document.getElementById('edit-post-content').value,
            category: category,
            imageUrl: document.getElementById('edit-post-image').value.trim()
        };

        if (category === 'jobs') {
            postData.jobType = document.getElementById('edit-job-type').value;
            postData.employment = document.getElementById('edit-job-employment').value;
            postData.location = document.getElementById('edit-job-location').value;
            postData.salary = document.getElementById('edit-job-salary').value;
            postData.contactName = document.getElementById('edit-job-contact-name').value;
            postData.contactPhone = document.getElementById('edit-job-contact-phone').value;
            postData.contactEmail = document.getElementById('edit-job-contact-email').value;
        }

        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                msg.textContent = 'Запись успешно обновлена!';
                msg.className = 'alert alert-success mt-3';
                msg.classList.remove('d-none');
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('editPostModal')).hide();
                    msg.classList.add('d-none');
                    window.fetchContent();
                }, 1500);
            } else {
                const err = await res.json();
                msg.textContent = err.message || 'Ошибка при обновлении';
                msg.className = 'alert alert-danger mt-3';
                msg.classList.remove('d-none');
            }
        } catch (error) {
            msg.textContent = 'Ошибка сети';
            msg.className = 'alert alert-danger mt-3';
            msg.classList.remove('d-none');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Сохранить';
        }
    });

    document.getElementById('add-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('post-form-message');
        const submitBtn = document.getElementById('add-post-form').querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Публикация...';
        
        const category = document.getElementById('post-category').value;
        const postData = {
            title: document.getElementById('post-title').value,
            content: document.getElementById('post-content').value,
            category: category,
            imageUrl: document.getElementById('post-image').value.trim()
        };

        if (category === 'jobs') {
            postData.jobType = document.getElementById('job-type').value;
            postData.employment = document.getElementById('job-employment').value;
            postData.location = document.getElementById('job-location').value;
            postData.salary = document.getElementById('job-salary').value;
            postData.contactName = document.getElementById('job-contact-name').value;
            postData.contactPhone = document.getElementById('job-contact-phone').value;
            postData.contactEmail = document.getElementById('job-contact-email').value;
        }

        try {
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                msg.textContent = 'Запись успешно опубликована!';
                msg.className = 'alert alert-success mt-3';
                msg.classList.remove('d-none');
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('addPostModal')).hide();
                    document.getElementById('add-post-form').reset();
                    msg.classList.add('d-none');
                    window.fetchContent();
                    fetchStats();
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
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    document.getElementById('supportStatusBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            window.toggleSupportStatus(document.getElementById('supportStatusBtn'), currentSupportRequest._id, currentSupportRequest.status);
        }
    });

    document.getElementById('supportDeleteBtn').addEventListener('click', () => {
        if (currentSupportRequest) {
            window.deleteSupport(document.getElementById('supportDeleteBtn'), currentSupportRequest._id);
        }
    });

    document.getElementById('support-tab').addEventListener('click', window.fetchSupport);
    document.getElementById('users-tab').addEventListener('click', window.fetchUsers);
    document.getElementById('content-tab').addEventListener('click', window.fetchContent);

    document.getElementById('copyPasswordBtn').addEventListener('click', () => {
        const passwordText = document.getElementById('tempPasswordInput').textContent;
        navigator.clipboard.writeText(passwordText).then(() => {
            const btn = document.getElementById('copyPasswordBtn');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check fs-5"></i>';
            btn.classList.replace('btn-outline-primary', 'btn-success');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.replace('btn-success', 'btn-outline-primary');
            }, 2000);
        });
    });

    fetchStats();
    window.fetchUsers();
    window.fetchSupport();
    window.fetchContent();
});