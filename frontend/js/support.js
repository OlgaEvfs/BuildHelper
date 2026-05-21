document.addEventListener('DOMContentLoaded', () => {
    const supportForm = document.getElementById('support-form');
    
    if (supportForm) {
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageDiv = document.getElementById('support-form-message');
            const submitBtn = supportForm.querySelector('button[type="submit"]');
            
            // Gather input data
            const email = document.getElementById('support-email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.textContent = 'Please enter a valid email address';
                messageDiv.className = 'alert alert-danger mt-3';
                messageDiv.classList.remove('d-none');
                return;
            }

            const formData = {
                name: document.getElementById('support-name').value.trim(),
                email: email,
                subject: document.getElementById('support-subject').value.trim(),
                message: document.getElementById('support-message').value.trim()
            };

            // Disable submit button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';

            try {
                const response = await fetch('/api/support', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                messageDiv.classList.remove('d-none', 'alert-danger', 'alert-success');
                
                if (response.ok) {
                    messageDiv.textContent = 'Request submitted! Admin will contact you shortly.';
                    messageDiv.classList.add('alert-success');
                    supportForm.reset();
                    
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('supportModal'));
                        if (modal) modal.hide();
                        messageDiv.classList.add('d-none');
                    }, 3000);
                } else {
                    messageDiv.textContent = data.message || 'Submission error';
                    messageDiv.classList.add('alert-danger');
                }
            } catch (err) {
                console.error('Support error:', err);
                messageDiv.textContent = 'Server connection error';
                messageDiv.classList.add('alert-danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});