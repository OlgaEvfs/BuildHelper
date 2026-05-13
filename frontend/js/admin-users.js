document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let userToDelete = null;

    const API_URL = '/api/admin/users';
    const token = localStorage.getItem('token');

    // Проверка права доступа
    const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!token || user.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Загрузка списка пользователей
    async function fetchUsers() {
        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Ошибка доступа или сервера');
            const users = await res.json();
            renderUsers(users);
        } catch (err) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
        }
    }

    function renderUsers(users) {
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Пользователи не найдены</td></tr>`;
            return;
        }
        usersTableBody.innerHTML = users.map(u => `
            <tr class="user-row">
                <td>
                    <div class="fw-bold">${u.username}</div>
                    <div class="small text-muted">${u.email}</div>
                </td>
                <td>
                    ${u.role === 'admin' ? '<span class="admin-badge">Admin</span>' : 'User'}
                </td>
                <td>
                    <span class="status-${u.status === 'active' ? 'active' : 'banned'}">
                        ${u.status === 'active' ? 'Активен' : 'Забанен'}
                    </span>
                </td>
                <td class="small">
                    ${new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning" onclick="toggleStatus('${u._id}', '${u.status}')" title="Бан/Разбан" ${u.role === 'admin' ? 'disabled' : ''}>
                            <i class="fas fa-ban"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="resetPassword('${u._id}')" title="Сброс пароля">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="openDeleteModal('${u._id}', '${u.username}')" title="Удалить" ${u.role === 'admin' ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Бан/Разбан
    window.toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            const res = await fetch(`${API_URL}/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchUsers();
        } catch (err) { console.error(err); }
    };

    // Сброс пароля
    window.resetPassword = async (id) => {
        if (!confirm('Сбросить пароль и выдать временный?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}/reset-password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Пароль сброшен!\n\nВременный пароль: ${data.tempPassword}\n\nПередайте его пользователю.`);
            }
        } catch (err) { console.error(err); }
    };

    // Удаление
    window.openDeleteModal = (id, name) => {
        userToDelete = id;
        document.getElementById('deleteUserName').textContent = name;
        deleteModal.show();
    };

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`${API_URL}/${userToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                deleteModal.hide();
                fetchUsers();
            }
        } catch (err) { console.error(err); }
    });

    fetchUsers();
});