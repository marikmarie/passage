
<div class="page-header">
  <div class="page-header-left">
    <p>Dashboard</p>
    <p id="db-date">Loading date…</p>
  </div>
  <div class="header-actions">
    <button class="btn-outline"><i class="ti ti-download" aria-hidden="true"></i> Export</button>
    <button class="btn-primary"><i class="ti ti-plus" aria-hidden="true"></i> Add Ride</button>
  </div>
</div>

<!-- STATS -->
<div class="stats-grid">
  <div class="stat-card hero">
    <div class="stat-icon" style="background:rgba(255,255,255,.15);">
      <i class="ti ti-motorbike" style="color:#fff;" aria-hidden="true"></i>
    </div>
    <p class="stat-label">Total Rides Today</p>
    <p class="stat-val">110</p>
    <p class="stat-sub">
      <i class="ti ti-trending-up" aria-hidden="true"></i> +12% from yesterday
    </p>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:var(--green-50);">
      <i class="ti ti-user-check" style="color:var(--green-500);font-size:18px;" aria-hidden="true"></i>
    </div>
    <p class="stat-label">Active Riders</p>
    <p class="stat-val">90</p>
    <p class="stat-sub sub-up"><i class="ti ti-circle-check" aria-hidden="true"></i> On duty now</p>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:var(--blue-50);">
      <i class="ti ti-school" style="color:var(--blue-600);font-size:18px;" aria-hidden="true"></i>
    </div>
    <p class="stat-label">Children Scheduled</p>
    <p class="stat-val">110</p>
    <p class="stat-sub sub-mute"><i class="ti ti-calendar" aria-hidden="true"></i> All routes loaded</p>
  </div>
  <div class="stat-card">
    <div class="stat-icon" style="background:var(--amber-50);">
      <i class="ti ti-flag-check" style="color:var(--amber-600);font-size:18px;" aria-hidden="true"></i>
    </div>
    <p class="stat-label">Completed Rides</p>
    <p class="stat-val">90</p>
    <p class="stat-sub sub-up"><i class="ti ti-check" aria-hidden="true"></i> 82% completion rate</p>
  </div>
</div>

<!-- MID ROW: chart + alerts -->
<div class="mid-grid">
  <div class="card">
    <div class="card-header">
      <span class="card-title">Ride Activity — This Week</span>
      <span class="card-meta">Mon – Sat</span>
    </div>
    <div class="bar-chart">
      <div class="bars">
        <div class="bar-col">
          <div class="bar-fill" style="height:74%;background:var(--green-200);" title="Monday: 85"></div>
          <span class="bar-day">M</span>
        </div>
        <div class="bar-col">
          <div class="bar-fill" style="height:83%;background:var(--green-200);" title="Tuesday: 95"></div>
          <span class="bar-day">T</span>
        </div>
        <div class="bar-col">
          <div class="bar-fill" style="height:89%;background:var(--green-200);" title="Wednesday: 102"></div>
          <span class="bar-day">W</span>
        </div>
        <div class="bar-col">
          <div class="bar-fill" style="height:100%;background:var(--green-500);" title="Thursday: 115 (peak)"></div>
          <span class="bar-day">T</span>
        </div>
        <div class="bar-col">
          <div class="bar-fill" style="height:85%;background:var(--green-200);" title="Friday: 98"></div>
          <span class="bar-day">F</span>
        </div>
        <div class="bar-col">
          <div class="bar-fill" style="height:96%;background:var(--green-700);" title="Saturday: 110 (today)"></div>
          <span class="bar-day">S</span>
        </div>
      </div>
      <div class="chart-stats">
        <div class="cs-item">
          <p>Avg / day</p>
          <p>101</p>
        </div>
        <div class="cs-item">
          <p>Peak</p>
          <p>Thu · 115</p>
        </div>
        <div class="cs-item">
          <p>Week total</p>
          <p>605</p>
        </div>
        <div class="cs-item">
          <p>On-time rate</p>
          <p>94%</p>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="display:flex;flex-direction:column;">
    <div class="card-header">
      <span class="card-title">Live Alerts</span>
      <span
        style="background:var(--red-50);color:var(--red-600);font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;">3
        active</span>
    </div>
    <div class="alert-list" style="flex:1;">
      <div class="alert-row">
        <div class="a-dot red"></div>
        <div class="a-body">
          <p>Kevin T. (KT-05) pickup overdue — no rider confirmation</p>
          <p>7:45 AM · 10 min ago</p>
        </div>
      </div>
      <div class="alert-row">
        <div class="a-dot amber"></div>
        <div class="a-body">
          <p>Device offline — Helmet-22 assigned to Ivan / Gloria N.</p>
          <p>7:32 AM · 23 min ago</p>
        </div>
      </div>
      <div class="alert-row">
        <div class="a-dot blue"></div>
        <div class="a-body">
          <p>Geofence exit: Brian K. left Kasai Rd safe zone</p>
          <p>7:18 AM · 37 min ago</p>
        </div>
      </div>
    </div>
    <button class="see-all-btn">
      View all alerts <i class="ti ti-arrow-right" style="font-size:13px;" aria-hidden="true"></i>
    </button>
  </div>
</div>

<!-- RIDES TABLE -->
<div class="card">
  <div class="table-toolbar">
    <div class="pill-row" id="filterPills">
      <button class="pill active" onclick="filterTable('all',this)">All</button>
      <button class="pill" onclick="filterTable('assigned',this)">Assigned</button>
      <button class="pill" onclick="filterTable('in-progress',this)">In Progress</button>
      <button class="pill" onclick="filterTable('pending',this)">Pending</button>
    </div>
    <div class="table-search">
      <i class="ti ti-search" style="color:var(--gray-400);font-size:14px;" aria-hidden="true"></i>
      <input type="text" placeholder="Search by ID, child, rider, plate…" oninput="searchTable(this.value)" />
    </div>
  </div>

  <div style="overflow-x:auto;">
    <table class="ride-table" id="rideTable" aria-label="Scheduled rides">
      <thead>
        <tr>
          <th>ID</th>
          <th>Child</th>
          <th>Rider</th>
          <th>Vehicle</th>
          <th>Plate / Helmet</th>
          <th>Pickup Location</th>
          <th>Time</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="rideBody">
        <!-- Rows injected by JS -->
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <span class="pag-info" id="pagInfo">Showing 1–8 of 110 rides</span>
    <div class="pag-btns">
      <button class="pag-btn">← Prev</button>
      <button class="pag-btn active">1</button>
      <button class="pag-btn">2</button>
      <button class="pag-btn">3</button>
      <button class="pag-btn">Next →</button>
    </div>
  </div>
</div>
