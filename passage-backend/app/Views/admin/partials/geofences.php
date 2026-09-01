<!-- Geofences Management Page -->
<style>
.card {
    background: var(--passage-white);
    border: 1px solid var(--gray-100);
    border-radius: 12px;
    overflow: hidden;
  }

  .card-header {
    padding: 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--gray-900);
  }

  .btn-primary {
    background: var(--green-700);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary:hover {
    background: var(--green-500);
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  thead tr {
    background: var(--gray-50);
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gray-400);
    border-bottom: 1px solid var(--gray-100);
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--gray-100);
  }

  tbody tr:hover {
    background: var(--gray-50);
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-school {
    background: var(--passage-danger-bg);
    color: var(--passage-danger-text);
  }

  .badge-pickup {
    background: var(--passage-warning-bg);
    color: var(--passage-warning-text);
  }

  .badge-danger {
    background: var(--passage-danger-bg);
    color: var(--passage-danger-text);
  }

  .action-btn {
    color: var(--green-500);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 13px;
    margin-right: 12px;
  }

  .action-btn:hover {
    color: var(--green-700);
  }

  .table-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--gray-100);
    color: var(--gray-600);
    font-size: 13px;
  }
</style>

<div class="card">
  <div class="card-header">
    <h3 class="card-title">Geofences Management</h3>
    <button class="btn-primary" onclick="handleCreateGeofence()">+ Create Geofence</button>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Location</th>
          <th>Radius</th>
          <th>Status</th>
          <th>Alerts</th>
          <th style="text-align:center;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Kampala Main Campus</td>
          <td><span class="badge badge-school">School Zone</span></td>
          <td>0.3156°N, 32.5891°E</td>
          <td>500m</td>
          <td>Active</td>
          <td>3 alerts</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('GEO-001', 'Geofence')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Nsambya Pickup Point</td>
          <td><span class="badge badge-pickup">Pickup Zone</span></td>
          <td>0.2856°N, 32.5745°E</td>
          <td>300m</td>
          <td>Active</td>
          <td>1 alert</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('GEO-002', 'Geofence')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Makerere Hill Zone</td>
          <td><span class="badge badge-school">School Zone</span></td>
          <td>0.3394°N, 32.5629°E</td>
          <td>450m</td>
          <td>Active</td>
          <td>0 alerts</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('GEO-003', 'Geofence')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Restricted Area - Kabul</td>
          <td><span class="badge badge-danger">Danger Zone</span></td>
          <td>0.3950°N, 32.6150°E</td>
          <td>1000m</td>
          <td>Active</td>
          <td>8 alerts</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('GEO-004', 'Geofence')">Edit</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="table-footer">
    <p>Total geofences: 87 | School zones: 34 | Pickup zones: 28 | Danger zones: 25</p>
  </div>
</div>
