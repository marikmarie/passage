<!-- Users Management Page -->
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

  .badge-parent {
    background: var(--passage-info-bg);
    color: var(--passage-info-strong);
  }

  .badge-rider {
    background: var(--passage-purple-bg);
    color: var(--passage-purple-text);
  }

  .badge-admin {
    background: var(--passage-orange-bg);
    color: var(--passage-orange-text);
  }

  .badge-active {
    background: var(--passage-success-bg);
    color: var(--passage-success-text);
  }

  .badge-inactive {
    background: var(--passage-neutral-bg);
    color: var(--passage-neutral-text);
  }

  .action-btn {
    color: var(--green-500);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 13px;
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
    <h3 class="card-title">Users Management</h3>
    <button class="btn-primary" onclick="handleAddUser()">+ Add User</button>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Status</th>
          <th>Joined</th>
          <th style="text-align:center;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Maria Asiimwe</td>
          <td>maria@passage.com</td>
          <td>+256 700 123456</td>
          <td><span class="badge badge-parent">Parent</span></td>
          <td><span class="badge badge-active">Active</span></td>
          <td>Feb 10, 2025</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('maria@passage.com', 'User')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Mariam Tukas</td>
          <td>mari@passage.com</td>
          <td>+256 700 654321</td>
          <td><span class="badge badge-admin">Admin</span></td>
          <td><span class="badge badge-active">Active</span></td>
          <td>Jan 5, 2025</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('mariam@passage.com', 'User')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">John Katumba</td>
          <td>john@passage.com</td>
          <td>+256 700 777777</td>
          <td><span class="badge badge-parent">Parent</span></td>
          <td><span class="badge badge-active">Active</span></td>
          <td>Jan 15, 2025</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('john@passage.com', 'User')">Edit</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Grace Nakato</td>
          <td>grace@passage.com</td>
          <td>+256 700 888888</td>
          <td><span class="badge badge-rider">Rider</span></td>
          <td><span class="badge badge-active">Active</span></td>
          <td>Feb 3, 2025</td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('grace@passage.com', 'User')">Edit</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="table-footer">
    <p>Total users: 1,248</p>
  </div>
</div>
