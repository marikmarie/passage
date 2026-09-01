<script>
  const RIDES = [
    { id: 'BK-01', child: 'Brian K.', rider: 'John', vehicle: 'TukTuk', plate: 'UBU-TTU', loc: 'Nile – Kasai Rd', time: '7:00 AM', status: 'assigned' },
    { id: 'AM-02', child: 'Aisha M.', rider: 'Sarah', vehicle: 'Boda', plate: 'Helmet-45', loc: 'Kololo – Kampala Rd', time: '7:15 AM', status: 'assigned' },
    { id: 'DO-03', child: 'Daniel O.', rider: 'Peter', vehicle: 'TukTuk-Shared', plate: 'UBE-234A', loc: 'Bweyogerere – Stage', time: '7:20 AM', status: 'in-progress' },
    { id: 'GN-04', child: 'Gloria N.', rider: 'Ivan', vehicle: 'Boda', plate: 'Helmet-22', loc: 'Nalya – Next to Shell', time: '7:30 AM', status: 'assigned' }
  ];

  const statusMap = {
    assigned: { label: 'Assigned', cls: 'badge-assigned', row: '' },
    'in-progress': { label: 'In Progress', cls: 'badge-progress', row: 'row-progress' },
    pending: { label: 'Pending', cls: 'badge-pending', row: 'row-pending' },
    done: { label: 'Done', cls: 'badge-done', row: '' },
  };

  let currentFilter = 'all';
  let currentSearch = '';

  function renderTable() {
    const body = document.getElementById('rideBody');
    const list = RIDES.filter(r => {
      const matchF = currentFilter === 'all' || r.status === currentFilter;
      const q = currentSearch.toLowerCase();
      const matchS = !q || [r.id, r.child, r.rider, r.plate, r.loc].some(v => v.toLowerCase().includes(q));
      return matchF && matchS;
    });
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--gray-400);font-size:13px;">No rides match this filter.</td></tr>`;
      return;
    }
    body.innerHTML = list.map(r => {
      const s = statusMap[r.status] || statusMap.assigned;
      return `
      <tr class="${s.row}">
        <td><span class="ride-id">${r.id}</span></td>
        <td><span class="ride-name">${r.child}</span></td>
        <td>${r.rider}</td>
        <td>${r.vehicle}</td>
        <td><span class="plate">${r.plate}</span></td>
        <td>${r.loc}</td>
        <td>${r.time}</td>
        <td><span class="badge ${s.cls}">${s.label}</span></td>
        <td><button class="view-btn" onclick="viewRide('${r.id}')">View</button></td>
      </tr>`;
    }).join('');
  }

  function filterTable(f, el) {
    currentFilter = f;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    renderTable();
  }

  function searchTable(q) {
    currentSearch = q;
    renderTable();
  }

  function viewRide(id) {
    alert('Opening ride details for ' + id);
  }

  // date
  const d = new Date();
  document.getElementById('db-date').textContent = d.toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' · Kampala';

  renderTable();
</script>
