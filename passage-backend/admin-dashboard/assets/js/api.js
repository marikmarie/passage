// API Client
const apiClient = {
  baseURL: 'http://localhost:3000/api/v1',

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: authManager.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 401) {
        authManager.logout();
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request('GET', endpoint);
  },

  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  },

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  },
};

// API Endpoints
const endpoints = {
  auth: {
    me: '/auth/me',
  },
  users: {
    all: '/users',
    byId: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
  },
  riders: {
    all: '/riders',
    byId: (id) => `/riders/${id}`,
    create: '/riders',
    update: (id) => `/riders/${id}`,
  },
  devices: {
    all: '/devices',
    byId: (id) => `/devices/${id}`,
    byRider: (riderId) => `/devices/rider/${riderId}`,
    create: '/devices',
    update: (id) => `/devices/${id}`,
  },
  tracking: {
    latest: (deviceId) => `/tracking/latest/${deviceId}`,
    history: (deviceId) => `/tracking/history/${deviceId}`,
    log: '/tracking/log',
  },
  alerts: {
    all: '/alerts',
    byDevice: (deviceId) => `/alerts/device/${deviceId}`,
    create: '/alerts',
    resolve: (id) => `/alerts/${id}/resolve`,
  },
  trips: {
    all: '/trips',
    byRider: (riderId) => `/trips/rider/${riderId}`,
    create: '/trips',
    end: (id) => `/trips/${id}/end`,
  },
  geofences: {
    all: '/geofences',
    byId: (id) => `/geofences/${id}`,
    create: '/geofences',
    update: (id) => `/geofences/${id}`,
    delete: (id) => `/geofences/${id}`,
  },
  payments: {
    all: '/payments',
    create: '/payments',
    verify: (id) => `/payments/verify/${id}`,
  },
  subscriptions: {
    all: '/subscriptions/all',
    byUser: '/subscriptions',
    create: '/subscriptions',
    upgrade: (id) => `/subscriptions/${id}/upgrade`,
  },
  reports: {
    analytics: '/reports/analytics',
    dailyTrips: '/reports/daily-trips',
    sosFrequency: '/reports/sos-frequency',
    revenue: '/reports/revenue',
  },
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    userStatus: (id) => `/admin/users/${id}/status`,
    devices: '/admin/devices',
    alerts: '/admin/alerts',
    payments: '/admin/payments',
  },
};
