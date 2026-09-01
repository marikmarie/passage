<!-- Kids Management Page -->
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
    <h3 class="card-title">Kids Management</h3>
    <button class="btn-primary" onclick="handleAddKid()">+ Add Kid</button>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Parent</th>
          <th>Device ID</th>
          <th>School</th>
          <th>Grade</th>
          <th>Status</th>
          <th style="text-align:center;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Amina Nalule</td>
          <td>Maria Asiimwe</td>
          <td>DEV-101</td>
          <td>St. Agnes Primary</td>
          <td>Primary 5</td>
          <td><span class="badge badge-active">Assigned</span></td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('Amina Nalule', 'Kid')">View</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Solomon Ssebunya</td>
          <td>John Katumba</td>
          <td>DEV-102</td>
          <td>Greenhill Academy</td>
          <td>Primary 4</td>
          <td><span class="badge badge-active">Assigned</span></td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('Solomon Ssebunya', 'Kid')">View</button></td>
        </tr>
        <tr>
          <td style="font-weight:600;color:var(--gray-900);">Naomi Kisakye</td>
          <td>Grace Nakato</td>
          <td>DEV-103</td>
          <td>Lakeview Primary</td>
          <td>Primary 3</td>
          <td><span class="badge badge-inactive">Unassigned</span></td>
          <td style="text-align:center;"><button class="action-btn" onclick="handleViewDetails('Naomi Kisakye', 'Kid')">View</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="table-footer">
    <p>Total kids: 128 | Assigned: 102 | Unassigned: 26</p>
  </div>
</div>

<script>
  function handleAddKid() {
    const form = `
      <div style="display:grid;gap:14px;">
        <label class="form-label">Child Name</label>
        <input type="text" placeholder="e.g. Alice N." class="form-input" id="kidName">
        <label class="form-label">Parent Name</label>
        <input type="text" placeholder="e.g. Maria Asiimwe" class="form-input" id="kidParent">
        <label class="form-label">Device ID</label>
        <input type="text" placeholder="e.g. DEV-101" class="form-input" id="kidDevice">
        <label class="form-label">School</label>
        <input type="text" placeholder="e.g. St. Agnes Primary" class="form-input" id="kidSchool">
        <label class="form-label">Grade</label>
        <input type="text" placeholder="e.g. Primary 5" class="form-input" id="kidGrade">
      </div>`;

    openModal('Register New Kid', form, [
      { label: 'Save', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { closeModal(); showToast('Kid registration saved'); } },
      { label: 'Cancel', className: 'bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal }
    ]);
  }
</script>
