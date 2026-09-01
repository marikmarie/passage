  if (!localStorage.getItem('admin_token')) {
    window.location.replace('/admin');
  }

  const pageTitles = {
    dashboard:'Dashboard', tracking:'Live Tracking', users:'Users',
    kids:'Kids', riders:'Riders', devices:'Devices', routes:'Routes',
    geofences:'Geofences', alerts:'Alerts', payments:'Payments'
  };

  async function loadPage(key, title, button) {
    document.getElementById('pageTitle').textContent = title || pageTitles[key] || 'Dashboard';
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (button) button.classList.add('active');

    const area = document.getElementById('contentArea');
    area.innerHTML = '<div class="page-loader"><i class="ti ti-loader-2" style="animation:spin 1s linear infinite;"></i> Loading…</div>';

    try {
      const res = await fetch(`/admin/view/${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error('Not found');
      const html = await res.text();
      area.innerHTML = html;
      // re-run any inline scripts
      area.querySelectorAll('script').forEach(old => {
        const s = document.createElement('script');
        s.textContent = old.textContent;
        old.replaceWith(s);
      });
    } catch {
      area.innerHTML = `
        <div style="text-align:center;padding:80px 20px;color:var(--gray-400);">
          <i class="ti ti-file-off" style="font-size:40px;display:block;margin-bottom:12px;"></i>
          <p style="font-size:14px;">This admin section could not be loaded.</p>
        </div>`;
    }
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function logout() {
    if (confirm('Log out of PASSAGE Admin?')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
  }

  // ==================== MODAL SYSTEM ====================
  function openModal(title, content, actions = []) {
    const modal = document.getElementById('modalDialog');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;

    const actionContainer = document.getElementById('modalActions');
    actionContainer.innerHTML = '';
    actions.forEach(action => {
      if (typeof action === 'string') {
        actionContainer.insertAdjacentHTML('beforeend', action);
        return;
      }
      const btn = document.createElement('button');
      btn.textContent = action.label;
      btn.className = action.className || 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700';
      btn.onclick = action.onclick;
      actionContainer.appendChild(btn);
    });

    modal.style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('modalDialog').style.display = 'none';
  }

  // ==================== FORM HANDLERS ====================
  function handleAddUser() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" placeholder="e.g. Maria Asiimwe" class="form-input" id="userName">
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" placeholder="maria@gmail.com" class="form-input" id="userEmail">
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" placeholder="+256 700 000000" class="form-input" id="userPhone">
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-input" id="userRole">
            <option>Parent</option>
            <option>Rider</option>
            <option>Admin</option>
          </select>
        </div>
      </div>
    `;
    openModal('Add New User', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Create', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('User created!'); closeModal(); } }
    ]);
  }

  function handleAddRider() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" placeholder="e.g. John Ssejjemba" class="form-input" id="riderName">
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" placeholder="+256 700 000000" class="form-input" id="riderPhone">
        </div>
        <div class="form-group">
          <label class="form-label">Vehicle Type</label>
          <select class="form-input" id="vehicleType">
            <option>Boda (Motorcycle)</option>
            <option>TukTuk</option>
            <option>TukTuk-Shared</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Vehicle Plate/ID</label>
          <input type="text" placeholder="e.g. UAX 123A" class="form-input" id="vehiclePlate">
        </div>
      </div>
    `;
    openModal('Register New Rider', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Register', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Rider registered!'); closeModal(); } }
    ]);
  }

  function handleRegisterDevice() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Device IMEI</label>
          <input type="text" placeholder="Enter 15-digit IMEI" class="form-input" id="deviceIMEI">
        </div>
        <div class="form-group">
          <label class="form-label">Assign to Child</label>
          <select class="form-input" id="assignChild">
            <option>-- Select Child --</option>
            <option>Brian K.</option>
            <option>Aisha M.</option>
            <option>Daniel O.</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Device Model</label>
          <input type="text" placeholder="e.g. PASSAGE Watch v1" class="form-input" id="deviceModel">
        </div>
      </div>
    `;
    openModal('Register Wearable Device', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Register', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Device registered!'); closeModal(); } }
    ]);
  }

  function handleCreateGeofence() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Geofence Name</label>
          <input type="text" placeholder="e.g. Central School" class="form-input" id="gfName">
        </div>
        <div class="form-group">
          <label class="form-label">Zone Type</label>
          <select class="form-input" id="gfType">
            <option>Home</option>
            <option>School</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Radius (meters)</label>
          <input type="number" placeholder="e.g. 500" class="form-input" id="gfRadius">
        </div>
        <div class="form-group">
          <label class="form-label">Location/Address</label>
          <input type="text" placeholder="Search address or drop pin..." class="form-input" id="gfLocation">
        </div>
      </div>
    `;
    openModal('Create Safe Zone', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Create', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Geofence created!'); closeModal(); } }
    ]);
  }

  function handleAddRide() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Child</label>
          <select class="form-input" id="childId">
            <option>-- Select Child --</option>
            <option>BK-01 (Brian K.)</option>
            <option>AM-02 (Aisha M.)</option>
            <option>DO-03 (Daniel O.)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rider</label>
          <select class="form-input" id="riderId">
            <option>-- Select Rider --</option>
            <option>John Ssejjemba</option>
            <option>Grace Nakato</option>
            <option>Peter Mwale</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Pickup Time</label>
          <input type="time" class="form-input" id="pickupTime">
        </div>
        <div class="form-group">
          <label class="form-label">Pickup Location</label>
          <input type="text" placeholder="Enter location..." class="form-input" id="pickupLoc">
        </div>
      </div>
    `;
    openModal('Schedule New Ride', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Schedule', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Ride scheduled!'); closeModal(); } }
    ]);
  }

  function handleCreateRoute() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Start Location</label>
          <input type="text" placeholder="e.g. Central School" class="form-input" id="routeStart">
        </div>
        <div class="form-group">
          <label class="form-label">End Location</label>
          <input type="text" placeholder="e.g. Plot 12, Kampala" class="form-input" id="routeEnd">
        </div>
        <div class="form-group">
          <label class="form-label">Distance (km)</label>
          <input type="number" placeholder="e.g. 15.5" class="form-input" id="routeDist">
        </div>
      </div>
    `;
    openModal('Create New Route', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Create', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Route created!'); closeModal(); } }
    ]);
  }

  function handleViewDetails(itemId, itemType) {
    let content = `<p class="text-gray-700"><strong>ID:</strong> ${itemId}</p><p class="text-gray-700"><strong>Type:</strong> ${itemType}</p><p class="text-gray-700 mt-4">Full details would load from API here.</p>`;
    openModal(`${itemType} Details`, content, [
      { label: 'Close', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal }
    ]);
  }

  function handleTrack(itemId) {
    const content = `<p class="text-gray-700">Real-time tracking for device <strong>${itemId}</strong></p><div class="w-full h-64 bg-gray-100 rounded-lg mt-4 flex items-center justify-center"><p class="text-gray-400">Map would load here</p></div>`;
    openModal('Live Tracking', content, [
      { label: 'Close', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal }
    ]);
  }

  function handleRespond(alertId) {
    const form = `
      <div class="modal-form">
        <p class="text-gray-700 font-semibold text-sm">Alert ID: ${alertId}</p>
        <div class="form-group">
          <label class="form-label">Response Action</label>
          <textarea placeholder="Describe the action taken..." class="form-input" style="height: 100px;" id="responseText"></textarea>
        </div>
      </div>
    `;
    openModal('Respond to Alert', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Submit', className: 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Response submitted!'); closeModal(); } }
    ]);
  }

  function handleExport() {
    alert('Exporting data...\nThis would trigger a CSV/Excel download from the API.');
  }

  function handleFilter() {
    const form = `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input" id="filterStatus">
            <option>All Statuses</option>
            <option>Success</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date Range</label>
          <select class="form-input" id="filterDateRange">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>
    `;
    openModal('Filter Transactions', form, [
      { label: 'Cancel', className: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold', onclick: closeModal },
      { label: 'Apply', className: 'bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold', onclick: () => { alert('Filter applied!'); closeModal(); } }
    ]);
  }

  // Close modal on background click
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('modalDialog');
    if (e.target === modal) closeModal();
  });

  window.addEventListener('load', () => {
    loadPage('dashboard', 'Dashboard');
  });
