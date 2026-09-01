<!-- SIDEBAR -->
<aside class="sidebar">
  <div class="sidebar-brand">
    <div class="brand-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
    <div>
      <div class="brand-name">PASSAGE</div>
      <div class="brand-sub">Admin Panel</div>
    </div>
  </div>

  <nav style="flex:1; overflow-y:auto; padding-bottom:12px;">
    <div class="nav-section">
      <div class="nav-label">Overview</div>
      <button class="nav-item active" onclick="loadPage('dashboard','Dashboard',this)">
        <i class="ti ti-layout-dashboard"></i> Dashboard
      </button>
      <button class="nav-item" onclick="loadPage('tracking','Live Tracking',this)">
        <i class="ti ti-map-pin"></i> Live Tracking
      </button>
    </div>

    <div class="nav-section" style="margin-top:16px;">
      <div class="nav-label">Management</div>
      <button class="nav-item" onclick="loadPage('users','Users',this)">
        <i class="ti ti-users"></i> Users
      </button>
      <button class="nav-item" onclick="loadPage('kids','Kids',this)">
        <i class="ti ti-baby-carriage"></i> Kids
      </button>
      <button class="nav-item" onclick="loadPage('riders','Riders',this)">
        <i class="ti ti-motorbike"></i> Riders
      </button>
      <button class="nav-item" onclick="loadPage('devices','Devices',this)">
        <i class="ti ti-device-watch"></i> Devices
      </button>
      <button class="nav-item" onclick="loadPage('routes','Routes',this)">
        <i class="ti ti-route"></i> Routes
      </button>
    </div>

    <div class="nav-section" style="margin-top:16px;">
      <div class="nav-label">Operations</div>
      <button class="nav-item" onclick="loadPage('geofences','Geofences',this)">
        <i class="ti ti-map-2"></i> Geofences
      </button>
      <button class="nav-item" onclick="loadPage('alerts','Alerts',this)">
        <i class="ti ti-bell-ringing"></i> Alerts
        <span class="nav-badge">3</span>
      </button>
      <button class="nav-item" onclick="loadPage('payments','Payments',this)">
        <i class="ti ti-credit-card"></i> Payments
      </button>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="user-row">
      <div class="user-avatar">A</div>
      <div>
        <div class="user-name">Admin</div>
        <div class="user-role">Super Admin</div>
      </div>
    </div>
    <button class="logout-btn" onclick="logout()">
      <i class="ti ti-logout"></i> Logout
    </button>
  </div>
</aside>
