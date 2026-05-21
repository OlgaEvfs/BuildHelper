// Fetch and render news
window.fetchNews = async function() {
    const contentContainer = document.querySelector('.tabcontainer-content');
    const itemsContainer = document.querySelector('.tabheader-items');

    if (!contentContainer || !itemsContainer) return;

    // Show loader
    contentContainer.innerHTML = '<div class="bh-loader-container"><div class="bh-spinner"></div><div class="bh-loader-text">Loading news...</div></div>';

    try {
        const response = await fetch('/api/news?limit=5');
        
        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();
        const news = data.news; 

        contentContainer.innerHTML = ''; 
        itemsContainer.innerHTML = ''; // Clear header list

        if (!news || news.length === 0) {
            contentContainer.innerHTML = `
                <div class="p-5 text-center">
                    <p class="text-muted">No news available. New content coming soon!</p>
                </div>`;
            return;
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

        news.forEach((item, i) => {
            const contentBlock = document.createElement('div');
            contentBlock.className = 'tabcontent';
            contentBlock.setAttribute('data-category', item.category);
            if (item.jobType) contentBlock.setAttribute('data-job-type', item.jobType);

            const label = item.category === 'jobs' ? `Job: ${getJobTypeName(item.jobType)}` : `News: ${getCategoryName(item.category)}`;

            contentBlock.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="tabcontent-desc">
                    <div class="news-date">
                        <span class="bh-text-orange fw-bold">${label}</span> • 
                        ${new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2>${item.title}</h2>
                    <p>${item.content.length > 120 ? item.content.substring(0, 120) + '...' : item.content}</p>
                    <a href="/news-detail.html?id=${item._id}" class="btn-read">${item.category === 'jobs' ? 'Apply' : 'Read more'}</a>
                </div>
            `;
            contentContainer.appendChild(contentBlock);

            const headerItem = document.createElement('div');
            headerItem.className = 'tabheader-item';
            headerItem.setAttribute('data-category', item.category);
            if (item.jobType) headerItem.setAttribute('data-job-type', item.jobType);
            headerItem.textContent = item.title;

            itemsContainer.appendChild(headerItem);
        });

        if (data.pagination.totalItems > 5) {
            const allNewsLink = document.createElement('a');
            allNewsLink.href = "/news.html";
            allNewsLink.className = "tabheader-all-news bh-text-accent";
            allNewsLink.innerHTML = "All news →";
            itemsContainer.appendChild(allNewsLink);
        }

        window.initNewsTabs();

    } catch (err) {
        console.error("News load error:", err);
        contentContainer.innerHTML = `
            <div class="p-5 text-center">
                <p style="color: var(--error-red); font-weight: 600;">Failed to load news</p>
                <button class="btn btn-sm bh-btn-outline mt-2" onclick="fetchNews()">Retry</button>
            </div>`;
    }
};

// Initialize news tabs
window.initNewsTabs = function() {
    const tabs = document.querySelectorAll('.tabheader-item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        itemsParent = document.querySelector('.tabheader-items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.style.display = 'none';
        });
        tabs.forEach(item => item.classList.remove('tabheader-item-active'));
    }

    function showTabContent(i = 0) {
        if (tabs[i] && tabsContent[i]) {
            hideTabContent();
            tabsContent[i].style.display = 'block';
            tabs[i].classList.add('tabheader-item-active');
        }
    }

    if (itemsParent) {
        itemsParent.onclick = (e) => {
            const target = e.target;
            if (target && target.classList.contains('tabheader-item')) {
                tabs.forEach((item, i) => {
                    if (target == item) showTabContent(i);
                });
            }
        };
    }

    // Show first tab
    if (tabs.length > 0) {
        showTabContent(0);
    }
};