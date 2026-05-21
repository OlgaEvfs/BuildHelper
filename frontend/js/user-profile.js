document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Redirect to login if token is missing
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Check for password change requirement (temporary password from admin)
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.resetPasswordRequired) {
        const resetAlert = document.getElementById('reset-password-alert');
        if (resetAlert) {
            resetAlert.classList.remove('d-none');
        }
    }

    // Tab switching logic
    const menuLinks = document.querySelectorAll('.list-group-item[data-target]');
    const sections = document.querySelectorAll('section[id]');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // Remove active class from all links and add to clicked
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all sections and show target
            sections.forEach(s => s.classList.add('d-none'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('d-none');
            }

            // Load data based on active tab
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

    // Handle "Back to profile" buttons inside sections
    document.querySelectorAll('.back-to-profile').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const profileTab = document.querySelector('[data-target="profile-section"]');
            if (profileTab) profileTab.click(); // Simulate click on first menu tab
        });
    });

    // Load profile data
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
        console.error('Profile load error:', error);
    }

    // Password change block
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const passwordMessage = document.getElementById('password-message');
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            
            // Disable button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Updating...';

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
                    passwordMessage.textContent = 'Password successfully updated!';
                    passwordMessage.classList.add('alert-success');
                    changePasswordForm.reset();

                    // Update localStorage to remove notification
                    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    currentUser.resetPasswordRequired = false;
                    localStorage.setItem('userInfo', JSON.stringify(currentUser));

                    // Hide notification
                    const resetAlert = document.getElementById('reset-password-alert');
                    if (resetAlert) resetAlert.classList.add('d-none');

                } else {
                    passwordMessage.textContent = data.message || 'Error updating password';
                    passwordMessage.classList.add('alert-danger');
                }
            } catch (error) {
                passwordMessage.textContent = 'Server connection error';
                passwordMessage.classList.add('alert-danger');
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // --- JOB MANAGEMENT FUNCTIONS ---

    // Variable to store list of all user jobs
    let myJobs = [];

    async function loadMyJobs() {
        const list = document.getElementById('my-jobs-list');
        try {
            const res = await fetch('/api/news/my-jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            myJobs = await res.json();

            if (myJobs.length === 0) {
                list.innerHTML = '<p class="text-muted italic">No posted jobs.</p>';
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
                                <p class="small text-muted mb-2">${job.location || 'Location not specified'} | ${new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <span class="badge bh-bg-light text-dark mb-2">${getJobTypeName(job.jobType)}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-warning" onclick="openEditModal('${job._id}')">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-job-btn" data-id="${job._id}">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.delete-job-btn').forEach(btn => {
                btn.onclick = () => deleteJob(btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<p class="text-danger">Error loading jobs.</p>';
        }
    }

    // Edit job
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
                    showNotification('Job updated and sent for moderation!', 'success');
                } else {
                    const err = await res.json();
                    showNotification(err.message || 'Update error', 'danger');
                }
            } catch (err) {
                showNotification('Network error', 'danger');
            }
        });
    }

    function getJobTypeName(type) {
        const types = {
            finishing: 'Finishing',
            plumbing: 'Plumbing',
            electrical: 'Electrical',
            masonry: 'Masonry',
            roofing: 'Roofing',
            hvac: 'HVAC',
            general: 'General'
        };
        return types[type] || type;
    }

    const addJobForm = document.getElementById('add-job-form');
    if (addJobForm) {
        addJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('job-form-message');
            const submitBtn = addJobForm.querySelector('button[type="submit"]');
            
            // Disable button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Publishing...';
            
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
                        ? 'Job sent for moderation and will appear after review!' 
                        : 'Job successfully published!';
                    msg.className = 'alert alert-success mt-3';
                    msg.classList.remove('d-none');
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
                        modal.hide();
                        addJobForm.reset();
                        msg.classList.add('d-none');
                        // Restore button
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        loadMyJobs();
                    }, 3000);
                } else {
                    const err = await res.json();
                    msg.textContent = err.message || 'Creation error';
                    msg.className = 'alert alert-danger mt-3';
                    msg.classList.remove('d-none');
                    // Restore button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                msg.textContent = 'Network error';
                msg.className = 'alert alert-danger mt-3';
                msg.classList.remove('d-none');
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    async function deleteJob(id) {
        window.showConfirmation('Delete job?', 'This job will be deleted permanently.', async () => {
            try {
                const res = await fetch(`/api/news/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) loadMyJobs();
            } catch (err) {
                showNotification('Delete failed.', 'danger');
            }
        }, 'Delete');
    }

    // --- CALCULATION MANAGEMENT FUNCTIONS ---

    async function loadUserCalculations() {
        const list = document.getElementById('calculations-list');
        try {
            const res = await fetch('/api/calculations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.length === 0) {
                list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No calculations saved yet.</td></tr>';
                return;
            }

            list.innerHTML = data.map(calc => `
                <tr>
                    <td><span class="fw-bold text-dark">${calc.type}</span></td>
                    <td>${calc.result}</td>
                    <td class="small text-muted">${new Date(calc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td class="text-end">
                        <button class="btn btn-sm text-danger p-0 delete-calc-btn" data-id="${calc._id}" title="Delete">&times;</button>
                    </td>
                </tr>
            `).join('');

            document.querySelectorAll('.delete-calc-btn').forEach(btn => {
                btn.onclick = () => deleteCalculation(btn, btn.getAttribute('data-id'));
            });
        } catch (err) {
            list.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>';
        }
    }

    async function deleteCalculation(btn, id) {
        window.showConfirmation('Delete calculation?', 'This calculation will be deleted from history.', async () => {
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
            try {
                const res = await fetch(`/api/calculations/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    showNotification('Calculation deleted', 'success');
                    loadUserCalculations();
                } else {
                    showNotification('Failed to delete calculation.', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            } catch (err) {
                showNotification('Delete error', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }, 'Delete');
    }

    // ---------- CHECKLIST MANAGEMENT FUNCTIONS ------------

    async function loadUserChecklist() {
        const container = document.getElementById('user-checklist-container');
        try {
            const res = await fetch('/api/checklist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tasks = await res.json();
            if (tasks.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-3">Your task list is empty.</p>';
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
                    <button class="btn btn-sm text-danger delete-task-btn" data-id="${task._id}" title="Delete">&times;</button>
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
            container.innerHTML = '<p class="text-danger">Error loading list.</p>';
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
                showNotification('Failed to add task', 'danger');
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
            showNotification('Update error', 'danger');
        }
    }

    async function deleteTask(id) {
        window.showConfirmation('Delete task?', 'This task will be deleted from your list.', async () => {
            try {
                await fetch(`/api/checklist/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification('Task deleted', 'success');
                loadUserChecklist();
            } catch (err) {
                showNotification('Delete error', 'danger');
            }
        }, 'Delete');
    }

    function updateChecklistProgress(completed, total) {
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        document.getElementById('checklist-progress-bar').style.width = percent + '%';
        document.getElementById('checklist-progress-text').textContent = percent + '%';
    }
});