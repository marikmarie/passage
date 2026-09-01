    // Password Fields Display Controller
    const toggleBtn = document.getElementById('togglePw');
    const pwInput = document.getElementById('password');
    const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
    const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88A3 3 0 0114.12 14.12M3 3l18 18"/></svg>`;

    toggleBtn.addEventListener('click', () => {
      const isText = pwInput.type === 'text';
      pwInput.type = isText ? 'password' : 'text';
      toggleBtn.innerHTML = isText ? eyeOpen : eyeClosed;
    });

    // Authenticate against the active PHP API instead of using a front-end-only development token.
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(`${window.location.origin}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (!response.ok || result?.data?.user?.role !== 'admin') {
          throw new Error(result?.message || 'Invalid credentials.');
        }
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('admin_token', result.data.token);
        window.location.href = '/admin/dashboard';
      } catch (error) {
        const alert = document.getElementById('errorAlert');
        alert.classList.remove('hidden');
        setTimeout(() => alert.classList.add('hidden'), 4000);
      }
    });
