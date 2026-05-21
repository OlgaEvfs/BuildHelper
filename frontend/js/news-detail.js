document.addEventListener('DOMContentLoaded', async () => {
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    const contentContainer = document.getElementById('news-detail-content');
    const commentsList = document.getElementById('comments-list');
    const commentFormWrapper = document.getElementById('comment-form-wrapper');
    const loginReminder = document.getElementById('login-reminder');
    const commentForm = document.getElementById('comment-form');

    if (!newsId) {
        contentContainer.innerHTML = '<div class="alert alert-danger">News ID not specified</div>';
        return;
    }

    // Check authorization and get user data
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (token) {
        commentFormWrapper.classList.remove('d-none');
        loginReminder.classList.add('d-none');
    }

    // Load news
    try {
        // Request to API
        const response = await fetch(`/api/news/${newsId}`);
        if (!response.ok) throw new Error('News not found');
        const news = await response.json();

        // Format date
        const date = new Date(news.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Initialize job details
        let jobDetailsHtml = '';

        // Add info for job category
        if (news.category === 'jobs') {
            jobDetailsHtml = `
                <div class="p-4 mb-4 rounded-4 border shadow-sm" style="background-color: #f8f9fa; border-left: 5px solid var(--accent-blue) !important;">
                    <div class="row text-center text-sm-start mb-3">
                        <div class="col-sm-4 mb-2 mb-sm-0">
                            <div class="text-muted small text-uppercase">Work Location</div>
                            <div class="fw-bold">${news.location || 'Not specified'}</div>
                        </div>
                        <div class="col-sm-4 mb-2 mb-sm-0">
                            <div class="text-muted small text-uppercase">Employment</div>
                            <div class="fw-bold">${news.employment || 'Not specified'}</div>
                        </div>
                        <div class="col-sm-4">
                            <div class="text-muted small text-uppercase">Salary</div>
                            <div class="fw-bold text-success">${news.salary || 'Negotiable'}</div>
                        </div>
                        <!-- Contacts -->
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Contact Name</div>
                                <div class="fw-bold">${news.contactName || 'Employer'}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Email</div>
                                <a href="mailto:${news.contactEmail}" class="fw-bold text-decoration-none text-dark">
                                    ${news.contactEmail || 'Not specified'}
                                </a>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small text-uppercase">Phone</div>
                                <a href="tel:${news.contactPhone}" class="fw-bold text-decoration-none mb-0" style="color: var(--accent-blue);">
                                    ${news.contactPhone || 'Not specified'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Helper functions for translation
        const getCategoryName = (cat) => {
            const categories = { 'tech': 'Technology', 'market': 'Market', 'experts': 'Experts', 'calendar': 'Calendar', 'jobs': 'Jobs' };
            return categories[cat] || 'News';
        };

        const getJobTypeName = (type) => {
            const types = { 'finishing': 'Finishing', 'plumbing': 'Plumbing', 'electrical': 'Electrical', 'masonry': 'Masonry', 'roofing': 'Roofing', 'hvac': 'HVAC', 'general': 'General' };
            return types[type] || 'General';
        };

        const categoryLabel = news.category === 'jobs' 
            ? `Job: ${getJobTypeName(news.jobType)}` 
            : `News: ${getCategoryName(news.category)}`;

        contentContainer.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <nav aria-label="breadcrumb" class="mb-4">
                        <ol class="breadcrumb bg-transparent p-0">
                            <li class="breadcrumb-item"><a href="/news.html" class="bh-text-orange text-decoration-none">All News</a></li>
                            <li class="breadcrumb-item active" aria-current="page">${news.title}</li>
                        </ol>
                    </nav>

                    <article class="news-article">
                        <h1 class="display-4 fw-bold mb-3">${news.title}</h1>
                        <div class="d-flex align-items-center gap-3 text-secondary mb-4">
                            <span class="badge bh-bg-orange">${categoryLabel}</span>
                            <time datetime="${news.createdAt}">${date}</time>
                        </div>
                        <div class="img-wrapper mb-5 shadow-sm rounded-4 overflow-hidden">
                            <img src="${news.imageUrl || 'images/logo.png'}" 
                                 class="img-fluid w-100" 
                                 alt="${news.title}" 
                                 style="opacity: 1 !important; object-fit: cover; max-height: 500px;"
                                 onerror="this.onerror=null; this.src='images/logo.png';">
                        </div>
                        
                        ${jobDetailsHtml}
                        <div class="news-content fs-5 lh-lg">${news.content}</div>
                    </article>
                </div>
            </div>
        `;

        // Update document title
        document.title = `${news.title} - BuildHelper`;

        // Load comments
        loadComments(newsId);

    } catch (error) {
        console.error('Error fetching news:', error);
        contentContainer.innerHTML = `
            <div class="text-center py-5">
                <h2 class="text-danger">Error!</h2>
                <p>${error.message}</p>
                <a href="/news.html" class="btn bh-btn-primary mt-3">Back to list</a>
            </div>
        `;
    }

    // Function to load comments
    async function loadComments(id) {
        try {
            const res = await fetch(`/api/comments/${id}`);
            const comments = await res.json();

            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="text-muted">No comments yet. Be the first!</p>';
                return;
            }

            commentsList.innerHTML = comments.map(c => {
                // Check if user is author or admin for delete button
                const isMyComment = c.author && c.author._id === userInfo._id;
                const isAdmin = userInfo.role === 'admin';
                const showDelete = isMyComment || isAdmin;
                
                // Check if author of comment is admin for badge
                const authorIsAdmin = c.author && c.author.role === 'admin';

                return `
                    <div class="comment-item mb-4 shadow-sm border-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <span class="comment-author">${c.author ? c.author.username : 'Anonymous'}</span>
                                ${authorIsAdmin ? '<span class="badge bg-dark ms-2" style="font-size: 0.6rem;">Admin</span>' : ''}
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="comment-date text-muted">${new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                ${showDelete ? `
                                    <button class="btn btn-sm text-danger p-0 lh-1 delete-comment-btn" data-id="${c._id}" title="Delete">&times;</button>
                                ` : ''}
                            </div>    
                        </div>
                        <div class="comment-text">${c.content}</div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    }

    // Handle comment deletion
    commentsList.addEventListener('click', async (e) => {
        // If delete button clicked
        if (e.target.classList.contains('delete-comment-btn')) {
            const commentId = e.target.getAttribute('data-id');

            window.showConfirmation(
                'Delete',
                'Delete this comment?',
                async () => {
                    try {
                        const res = await fetch(`/api/comments/${commentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (res.ok) {
                            showNotification('Comment deleted');
                            loadComments(newsId);
                        } else {
                            const data = await res.json();
                            showNotification(data.message || 'Error deleting', 'danger');
                        }
                    } catch (err) {
                        console.error("Error deleting comment:", err);
                        showNotification('Server error', 'danger');
                    }
                },
                'Delete'
            );
        }
    });

    // Post comment
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('comment-text').value;

            try {
                const res = await fetch('/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: text, newsId })
                });

                if (res.ok) {
                    document.getElementById('comment-text').value = ''; // Clear form
                    loadComments(newsId); // Reload list
                } else {
                    const errorData = await res.json();
                    showNotification(errorData.message || 'Error posting comment', 'danger');
                }
            } catch (err) {
                console.error("Error posting comment:", err);
            }
        });
    }
});