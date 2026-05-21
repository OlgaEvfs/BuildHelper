document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorDisplay = document.getElementById('register-error');

    // Reference input fields for styling
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Remove red highlight when user starts typing
    [usernameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });

    // Check email availability on blur
    emailInput.addEventListener('blur', async () => {
        const email = emailInput.value.trim();
        if (!email) return;

        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.exists) {
                emailInput.classList.add('is-invalid');
                errorDisplay.textContent = 'This email is already registered.';
                errorDisplay.classList.remove('d-none');
            }
        } catch (err) {
            console.error('Email check error:', err);
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Hide previous errors
            errorDisplay.classList.add('d-none');
            [usernameInput, emailInput, passwordInput].forEach(input => input.classList.remove('is-invalid'));

            // Gather input data
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate input
            let isInvalid = true;

            if (username.length < 3) {
                usernameInput.classList.add('is-invalid');
                isInvalid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailInput.classList.add('is-invalid');
                isInvalid = false;
            }

            const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
            if (!passwordRegex.test(password)) {
                passwordInput.classList.add('is-invalid');
                errorDisplay.textContent = 'Password must contain at least 8 characters, one uppercase letter, and one digit.';
                isInvalid = false;
            }

            // Abort if any field is invalid
            if (!isInvalid) {
                errorDisplay.textContent = 'Please check the correctness of the filled fields.';
                errorDisplay.classList.remove('d-none');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save token and user data to localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data));

                    // Show success message
                    const card = document.querySelector('.auth-card');
                    card.innerHTML = `
                        <div class="text-center py-4">
                            <div class="mb-3 text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            </div>
                            <h2 class="fw-bold">Registration successful!</h2>
                            <p class="text-muted">Welcome, ${data.username}!<br>Redirecting to home page.</p>
                        </div>
                    `

                    // Redirect after 5 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 5000);
                } else {
                    // Display server error
                    errorDisplay.textContent = data.message || 'Registration error';
                    errorDisplay.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Registration error:', error);
                errorDisplay.textContent = 'Unable to reach the server. Please try again later.';
                errorDisplay.classList.remove('d-none');
            }
        });
    }
});