document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const filters = document.getElementById('news-filters');
    const token = localStorage.getItem('token');
    const addJobContainer = document.getElementById('add-job-container');
    const pagination = document.getElementById('pagination');

    let currentCategory = 'all';
    let currentPage = 1;
    let currentJobType = 'all';

    // Handle filter clicks
    filters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            currentPage = 1;
            currentJobType = 'all'; // Reset subcategory when main category changes

            // Show or hide job subcategories
            const jobFilters = document.getElementById('job-filters');
            if (currentCategory === 'jobs') {
                jobFilters.classList.remove('d-none');
            } else {
                jobFilters.classList.add('d-none');
            }

            loadNews();
            checkAddPostButton();
        }
    });

    // Add event listener for job subcategories
    const jobFilters = document.getElementById('job-filters');
    jobFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            jobFilters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentJobType = e.target.getAttribute('data-jobtype');
            currentPage = 1;
            loadNews();
        }
    });

    // Load news from server
    async function loadNews() {
        if (newsGrid.children.length === 0 || newsGrid.querySelector('.bh-loader-container')) {
            showLoader();
        } else {
            newsGrid.classList.add('loading');
        }
        
        try {
            let url = `/api/news?page=${currentPage}&limit=6`;

            if (currentCategory !== 'all') {
                url += `&category=${currentCategory}`;
            }

            if (currentCategory === 'jobs' && currentJobType !== 'all') {
                url += `&jobType=${currentJobType}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            renderNews(data.news);
            renderPagination(data.pagination);
        } catch (error) {
            newsGrid.innerHTML = '<div class="text-center text-danger">Error loading</div>';
        } finally {
            newsGrid.classList.remove('loading'); // Remove loading effect
        }
    }

    function getJobTypeName(type) {
        const types = {
            'finishing': 'Finishing',
            'plumbing': 'Plumbing',
            'electrical': 'Electrical',
            'masonry': 'Masonry',
            'roofing': 'Roofing',
            'hvac': 'HVAC',
            'general': 'General'
        };
        return types[type] || 'General';
    }

    // Render news items
    function renderNews(news) {
        if (!news || news.length === 0) {
            newsGrid.innerHTML = `
                <div class="col-12" style="width: 100% !important; display: flex !important; justify-content: center !important; padding: 80px 0;">
                    <div style="text-align: center !important;">
                        <h3 class="fw-bold">No news found</h3>
                        <p class="text-muted">Try selecting a different category or filter</p>
                    </div>
                </div>
            `;
            return;
        }

        newsGrid.innerHTML = news.map(item => `
            <div class="col">
                <div class="news-card">
                    <img src="${item.imageUrl || 'images/logo.png'}" alt="${item.title}">
                    <div class="news-card-content">
                        <small>
                            ${item.category === 'jobs' ? `Job: ${getJobTypeName(item.jobType)}` : `News: ${getCategoryName(item.category)}`}
                            • ${new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </small>
                        <h3>${item.title}</h3>
                        <p>${item.content.substring(0, 120)}...</p>
                        <div class="text-center mt-auto">
                            <a href="/news-detail.html?id=${item._id}" class="btn bh-btn-outline">Read full</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    // Logic for "Add" button display
    function checkAddPostButton() {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const isAdmin = userInfo.role === 'admin';
        const addBtn = addJobContainer.querySelector('button');

        // Button visible to admin always, to users only in jobs
        if (token && (isAdmin || currentCategory === 'jobs')) {
            addJobContainer.classList.remove('d-none');
            
            // Set button text
            addBtn.textContent = isAdmin ? '+ Create publication' : '+ Publish job';
            
            const imageWrapper = document.getElementById('post-image-wrapper');
            const categorySelect = document.getElementById('post-category');
            
            if (isAdmin) {
                // Admin access
                if (imageWrapper) imageWrapper.classList.remove('d-none');
                if (categorySelect) {
                    categorySelect.parentElement.classList.remove('d-none');
                    categorySelect.querySelectorAll('option').forEach(opt => opt.style.display = 'block');
                }
            } else {
                // User access (only jobs)
                if (imageWrapper) imageWrapper.classList.add('d-none');
                if (categorySelect) {
                    categorySelect.parentElement.classList.add('d-none');
                    categorySelect.innerHTML = '<option value="jobs" selected>Job</option>';
                }
            }
                
            toggleJobFields();
        } else {
            addJobContainer.classList.add('d-none');
        }
    }

    function toggleJobFields() {
        const categorySelect = document.getElementById('post-category');
        const jobFields = document.getElementById('job-fields-wrapper');
        const phoneInput = document.getElementById('job-contact-phone');

        if (categorySelect && jobFields) {
            if (categorySelect.value === 'jobs') {
                jobFields.classList.remove('d-none');
                if (phoneInput) phoneInput.required = true;
            } else {
                jobFields.classList.add('d-none');
                if (phoneInput) phoneInput.required = false;
            }
        }
    }

    const categorySelect = document.getElementById('post-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', toggleJobFields);
    }

    checkAddPostButton();
   
    // Handle post form submission
    const addPostForm = document.getElementById('add-post-form');
    if (addPostForm) {
        addPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('post-form-message');
            const submitBtn = addPostForm.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publishing...';
            
            const category = document.getElementById('post-category').value;
            const formData = new FormData();
            
            // Append text fields
            formData.append('title', document.getElementById('post-title').value);
            formData.append('content', document.getElementById('post-content').value);
            formData.append('category', category);
            formData.append('imageUrl', document.getElementById('post-image').value.trim());

            if (category === 'jobs') {
                const phone = document.getElementById('add-post-form').querySelector('#job-contact-phone').value;
                const phoneRegex = /^\+?\d{7,15}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    msg.textContent = 'Fill in all fields';
                    msg.className = 'alert alert-danger mt-3';
                    msg.classList.remove('d-none');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    return;
                }
                formData.append('jobType', document.getElementById('job-type').value);
                formData.append('employment', document.getElementById('job-employment').value);
                formData.append('location', document.getElementById('job-location').value);
                formData.append('salary', document.getElementById('job-salary').value);
                formData.append('contactName', document.getElementById('job-contact-name').value);
                formData.append('contactPhone', phone);
                formData.append('contactEmail', document.getElementById('job-contact-email').value);
            }

            // Append file at the very end
            const imageFile = document.getElementById('post-image-file').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const res = await fetch('/api/news', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (res.ok) {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    msg.textContent = userInfo.role === 'admin' 
                        ? 'Publication successful!' 
                        : 'Sent for moderation!';
                    msg.className = 'alert alert-success mt-3';
                    msg.classList.remove('d-none');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    const err = await res.json();
                    msg.textContent = 'Fill in all fields';
                    msg.className = 'alert alert-danger mt-3';
                    msg.classList.remove('d-none');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                msg.textContent = 'Network error';
                msg.className = 'alert alert-danger mt-3';
                msg.classList.remove('d-none');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Render pagination
    function renderPagination(pageInfo) {
        const { totalPages, currentPage: page } = pageInfo;
        let html = '';

        if (!totalPages || totalPages === 0) {
            pagination.innerHTML = '';
            return;
        }

        // Previous button
        html += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="window.changePage(${page - 1})">«</button>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link" onclick="window.changePage(${i})">${i}</button>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="window.changePage(${page + 1})">»</button>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // Global changePage function for HTML
    window.changePage = (page) => {
        if (page < 1) return;
        currentPage = page;
        loadNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show loader
    function showLoader() {
        newsGrid.innerHTML = `
            <div class="col-12" style="width: 100% !important;">
                <div class="bh-loader-container">
                    <div class="bh-spinner"></div>
                    <div class="bh-loader-text">Loading news...</div>
                </div>
            </div>
        `;
    }

    // Get readable category name
    function getCategoryName(cat) {
        const categories = {
            'tech': 'Technology',
            'market': 'Market',
            'experts': 'Experts',
            'calendar': 'Calendar',
            'jobs': 'Jobs'
        };
        return categories[cat] || 'News';
    }

    loadNews();
});