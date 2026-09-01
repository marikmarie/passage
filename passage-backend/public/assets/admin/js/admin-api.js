(() => {
  const baseUrl = `${window.location.origin}/api/v1`;

  const request = async (method, endpoint, data = null) => {
    const token = localStorage.getItem('admin_token');
    const options = {
      method,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.replace('/admin');
    }

    if (!response.ok) {
      throw new Error(result.message || 'The request could not be completed.');
    }

    return result;
  };

  window.apiClient = {
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, data) => request('POST', endpoint, data),
    put: (endpoint, data) => request('PUT', endpoint, data),
    delete: (endpoint) => request('DELETE', endpoint),
  };

  window.endpoints = {
    admin: {
      riderReviews: '/admin/rider-reviews',
      riderReview: (id) => `/admin/rider-reviews/${id}`,
      riderReviewStatus: (id) => `/admin/rider-reviews/${id}/status`,
    },
  };
})();
