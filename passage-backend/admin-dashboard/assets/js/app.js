// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Views
const views = {
  dashboard: `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Riders</div>
        <div class="stat-value" id="activeRidersCount">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Devices</div>
        <div class="stat-value" id="activeDevicesCount">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">SOS Alerts Today</div>
        <div class="stat-value" id="sosAlertsCount">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Revenue Today</div>
        <div class="stat-value" id="revenueTodayCount">-</div>
      </div>
    </div>
    <div id="chartsContainer"></div>
  `,

  users: `
    <div class="table-card">
      <div class="table-header">
        <h3>Users Management</h3>
        <input type="text" class="table-search" id="userSearch" placeholder="Search users...">
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="usersTable"></tbody>
      </table>
    </div>
  `,

  riders: `
    <div class="table-card">
      <div class="table-header">
        <h3>Riders Management</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>School</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="ridersTable"></tbody>
      </table>
    </div>
  `,

  devices: `
    <div class="table-card">
      <div class="table-header">
        <h3>Devices Management</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>IMEI</th>
            <th>Rider</th>
            <th>Battery</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="devicesTable"></tbody>
      </table>
    </div>
  `,

  alerts: `
    <div class="table-card">
      <div class="table-header">
        <h3>Active Alerts</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Type</th>
            <th>Rider</th>
            <th>Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="alertsTable"></tbody>
      </table>
    </div>
  `,

  tracking: `
    <div id="trackingContainer" style="height: 600px; border-radius: 16px; overflow: hidden; background: var(--bg-card); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
      <div style="text-align: center; padding: 40px;">
        📍 Map integration would go here (e.g., Leaflet, Google Maps)
      </div>
    </div>
    <div class="table-card">
      <h3>Active Devices</h3>
      <table>
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Speed</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody id="trackingTable"></tbody>
      </table>
    </div>
  `,

  payments: `
    <div class="table-card">
      <div class="table-header">
        <h3>Transactions</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Amount</th>
            <th>User</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="paymentsTable"></tbody>
      </table>
    </div>
  `,

  subscriptions: `
    <div class="table-card">
      <div class="table-header">
        <h3>Subscriptions</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>User Email</th>
            <th>Plan</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="subscriptionsTable"></tbody>
      </table>
    </div>
  `,

  reports: `
    <div id="reportsContainer">
      <div class="table-card">
        <h3>Dashboard Analytics</h3>
        <div id="analyticsContainer"></div>
      </div>
    </div>
  `,

  geofences: `
    <div class="table-card">
      <h3>Safe Zones (Geofences)</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Radius (m)</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="geofencesTable"></tbody>
      </table>
    </div>
  `,

  trips: `
    <div class="table-card">
      <h3>Trip History</h3>
      <table>
        <thead>
          <tr>
            <th>Rider</th>
            <th>Device</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Distance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="tripsTable"></tbody>
      </table>
    </div>
  `,

  notifications: `
    <div class="table-card">
      <h3>Notifications Center</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Body</th>
            <th>Channel</th>
            <th>Sent At</th>
          </tr>
        </thead>
        <tbody id="notificationsTable"></tbody>
      </table>
    </div>
  `,
};

// Navigation
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const contentArea = document.getElementById('content');
  const pageTitle = document.getElementById('pageTitle');

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = item.getAttribute('data-view');

      // Update active nav
      navItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      // Update page title and content
      pageTitle.textContent = item.textContent;
      contentArea.innerHTML = views[viewName] || '<p>View not found</p>';

      // Load data for the view
      loadViewData(viewName);
    });
  });

  // Load default dashboard
  loadViewData('dashboard');
});

// Load view data
async function loadViewData(viewName) {
  try {
    switch (viewName) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'users':
        await loadUsers();
        break;
      case 'riders':
        await loadRiders();
        break;
      case 'devices':
        await loadDevices();
        break;
      case 'alerts':
        await loadAlerts();
        break;
      case 'tracking':
        await loadTracking();
        break;
      case 'payments':
        await loadPayments();
        break;
      case 'subscriptions':
        await loadSubscriptions();
        break;
      case 'reports':
        await loadReports();
        break;
      case 'geofences':
        await loadGeofences();
        break;
      case 'trips':
        await loadTrips();
        break;
      case 'notifications':
        await loadNotifications();
        break;
    }
  } catch (error) {
    console.error('Error loading view:', error);
    showToast('Error loading view', 'error');
  }
}

// Dashboard Data
async function loadDashboard() {
  try {
    const result = await apiClient.get(endpoints.reports.analytics);
    const data = result.data;

    document.getElementById('activeRidersCount').textContent = data.active_riders || '0';
    document.getElementById('activeDevicesCount').textContent = data.active_devices || '0';
    document.getElementById('sosAlertsCount').textContent = data.sos_alerts_today || '0';
    document.getElementById('revenueTodayCount').textContent = `$${data.revenue_today || 0}`;
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Users Data
async function loadUsers() {
  try {
    const result = await apiClient.get(endpoints.admin.users);
    const table = document.getElementById('usersTable');
    table.innerHTML = result.data.map(
      (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="badge success">${user.role}</span></td>
          <td><span class="badge success">${user.status}</span></td>
          <td><button class="btn btn-sm btn-primary">Edit</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Riders Data
async function loadRiders() {
  try {
    const result = await apiClient.get(endpoints.riders.all);
    const table = document.getElementById('ridersTable');
    table.innerHTML = (result.data || []).map(
      (rider) => `
        <tr>
          <td>${rider.id}</td>
          <td>Rider ${rider.id}</td>
          <td>${rider.school || 'N/A'}</td>
          <td>${rider.grade || 'N/A'}</td>
          <td><button class="btn btn-sm btn-primary">View</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading riders:', error);
  }
}

// Devices Data
async function loadDevices() {
  try {
    const result = await apiClient.get(endpoints.admin.devices);
    const table = document.getElementById('devicesTable');
    table.innerHTML = (result.data || []).map(
      (device) => `
        <tr>
          <td>${device.imei}</td>
          <td>Rider ${device.rider_id}</td>
          <td>${device.battery_level}%</td>
          <td><span class="badge success">${device.status}</span></td>
          <td>${new Date(device.last_seen).toLocaleDateString()}</td>
          <td><button class="btn btn-sm btn-primary">Details</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading devices:', error);
  }
}

// Alerts Data
async function loadAlerts() {
  try {
    const result = await apiClient.get(endpoints.admin.alerts);
    const table = document.getElementById('alertsTable');
    table.innerHTML = (result.data || []).map(
      (alert) => `
        <tr>
          <td>${alert.device_id}</td>
          <td><span class="badge danger">${alert.type}</span></td>
          <td>${alert.rider_id}</td>
          <td>${new Date(alert.created_at).toLocaleDateString()}</td>
          <td>${alert.resolved_at ? 'Resolved' : 'Active'}</td>
          <td><button class="btn btn-sm btn-primary">Resolve</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
}

// Tracking Data
async function loadTracking() {
  try {
    const result = await apiClient.get(endpoints.admin.devices);
    const table = document.getElementById('trackingTable');
    table.innerHTML = (result.data || []).map(
      (device) => `
        <tr>
          <td>${device.id}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>${new Date(device.updated_at).toLocaleDateString()}</td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading tracking:', error);
  }
}

// Payments Data
async function loadPayments() {
  try {
    const result = await apiClient.get(endpoints.admin.payments);
    const table = document.getElementById('paymentsTable');
    table.innerHTML = (result.data || []).map(
      (payment) => `
        <tr>
          <td>${payment.reference || 'N/A'}</td>
          <td>$${payment.amount}</td>
          <td>User ${payment.user_id}</td>
          <td><span class="badge success">${payment.status}</span></td>
          <td>${new Date(payment.created_at).toLocaleDateString()}</td>
          <td><button class="btn btn-sm btn-primary">View</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// Subscriptions Data
async function loadSubscriptions() {
  try {
    const result = await apiClient.get(endpoints.subscriptions.all);
    const table = document.getElementById('subscriptionsTable');
    table.innerHTML = (result.data || []).map(
      (sub) => `
        <tr>
          <td>User ${sub.user_id}</td>
          <td><span class="badge success">${sub.plan}</span></td>
          <td>${new Date(sub.start_date).toLocaleDateString()}</td>
          <td>${new Date(sub.end_date).toLocaleDateString()}</td>
          <td>Active</td>
          <td><button class="btn btn-sm btn-primary">Manage</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading subscriptions:', error);
  }
}

// Reports Data
async function loadReports() {
  try {
    const result = await apiClient.get(endpoints.reports.analytics);
    const container = document.getElementById('analyticsContainer');
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Active Riders</div>
          <div class="stat-value">${result.data.active_riders}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Devices</div>
          <div class="stat-value">${result.data.active_devices}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">SOS Alerts (Today)</div>
          <div class="stat-value">${result.data.sos_alerts_today}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue (Today)</div>
          <div class="stat-value">$${result.data.revenue_today}</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

// Geofences Data
async function loadGeofences() {
  try {
    const result = await apiClient.get(endpoints.geofences.all);
    const table = document.getElementById('geofencesTable');
    table.innerHTML = (result.data || []).map(
      (geo) => `
        <tr>
          <td>${geo.name}</td>
          <td>${geo.lat}, ${geo.lng}</td>
          <td>${geo.radius_m}</td>
          <td>${geo.active ? '✅' : '❌'}</td>
          <td><button class="btn btn-sm btn-primary">Edit</button></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading geofences:', error);
  }
}

// Trips Data
async function loadTrips() {
  try {
    const result = await apiClient.get(endpoints.trips.all);
    const table = document.getElementById('tripsTable');
    table.innerHTML = (result.data || []).map(
      (trip) => `
        <tr>
          <td>Rider ${trip.rider_id}</td>
          <td>Device ${trip.device_id}</td>
          <td>${new Date(trip.start_time).toLocaleDateString()}</td>
          <td>${trip.end_time ? new Date(trip.end_time).toLocaleDateString() : 'N/A'}</td>
          <td>${trip.distance_km} km</td>
          <td><span class="badge success">${trip.status}</span></td>
        </tr>
      `
    ).join('');
  } catch (error) {
    console.error('Error loading trips:', error);
  }
}

// Notifications Data
async function loadNotifications() {
  try {
    const result = await apiClient.get(endpoints.auth.me);
    const table = document.getElementById('notificationsTable');
    table.innerHTML = '<tr><td colspan="4">No notifications</td></tr>';
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}
