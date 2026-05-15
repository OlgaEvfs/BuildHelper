document.addEventListener('DOMContentLoaded', () => {
    const supportForm = document.getElementById('support-form');
    
    if (supportForm) {
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const messageDiv = document.getElementById('support-form-message');
            const submitBtn = supportForm.querySelector('button[type="submit"]');
            
            // Собираем данные
            const formData = {
                name: document.getElementById('support-name').value.trim(),
                email: document.getElementById('support-email').value.trim(),
                subject: document.getElementById('support-subject').value.trim(),
                message: document.getElementById('support-message').value.trim()
            };

            // Блокируем кнопку
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

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
                    messageDiv.textContent = 'Ваша заявка принята! Мы скоро свяжемся с вами.';
                    messageDiv.classList.add('alert-success');
                    supportForm.reset();
                    
                    // Закрываем модалку через пару секунд
                    setTimeout(() => {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('supportModal'));
                        if (modal) modal.hide();
                        messageDiv.classList.add('d-none');
                    }, 3000);
                } else {
                    messageDiv.textContent = data.message || 'Ошибка при отправке';
                    messageDiv.classList.add('alert-danger');
                }
            } catch (err) {
                console.error('Support error:', err);
                messageDiv.textContent = 'Ошибка соединения с сервером';
                messageDiv.classList.add('alert-danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить запрос';
            }
        });
    }
});