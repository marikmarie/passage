// Auth Management
const authManager = {
  token: localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('user') || '{}'),

  isAuthenticated() {
    return !!this.token;
  },

  setToken(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  },
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!authManager.isAuthenticated()) {
    window.location.href = 'index.html';
  }

  // Display user email
  const userEmailEl = document.getElementById('userEmail');
  if (userEmailEl) {
    userEmailEl.textContent = authManager.user.email || 'User';
  }

  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authManager.logout();
    });
  }
});
