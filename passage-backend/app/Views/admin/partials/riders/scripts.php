<script>
  let riders = [];
  let riderFilter = 'all';
  let riderQuery = '';

  function statusLabel(status) {
    return { draft: 'Draft', pending_review: 'Pending review', approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' }[status] || 'Unknown';
  }

  function statusBadge(status) {
    if (status === 'approved') return 'badge-active';
    if (status === 'pending_review') return 'badge-verified';
    return 'badge-inactive';
  }

  function documentCount(rider) {
    return [rider.national_id_front_url, rider.national_id_back_url, rider.profile_photo_url, rider.driving_licence_image_url, rider.permit_image_url, rider.vehicle_photo_url].filter(Boolean).length;
  }

  function formatDate(value) {
    if (!value) return 'Not submitted';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function vehicleLabel(rider) {
    const type = rider.vehicle_type === 'tuktuk' ? 'Tuk-tuk' : rider.vehicle_type === 'boda' ? 'Boda' : 'Vehicle';
    return `${type}${rider.number_plate ? ' · ' + rider.number_plate : ''}`;
  }

  async function loadRiderReviews() {
    const body = document.getElementById('ridersBody');
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:34px;color:var(--gray-400);">Loading rider reviews...</td></tr>';
    try {
      const status = riderFilter === 'all' ? 'all' : riderFilter;
      const result = await apiClient.get(`${endpoints.admin.riderReviews}?status=${encodeURIComponent(status)}&limit=100`);
      riders = result.data?.riders || [];
      renderRiders();
    } catch (error) {
      console.error('Error loading rider reviews:', error);
      riders = [];
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:34px;color:var(--red-600);">Could not load rider reviews. Check admin login and backend connection.</td></tr>';
      document.getElementById('riderCount').textContent = 'Showing 0 riders';
      if (typeof showToast === 'function') showToast(error.message || 'Could not load rider reviews', 'error');
    }
  }

  function renderRiders() {
    const body = document.getElementById('ridersBody');
    const q = riderQuery.toLowerCase();
    const rows = riders.filter((rider) => !q || [rider.full_name, rider.email, rider.phone_number, rider.vehicle_type, rider.number_plate, String(rider.id)].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
    document.getElementById('riderCount').textContent = `Showing ${rows.length} rider${rows.length === 1 ? '' : 's'}`;
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:34px;color:var(--gray-400);">No riders match the current filter.</td></tr>';
      return;
    }
    body.innerHTML = rows.map((rider) => {
      const docs = documentCount(rider);
      const status = rider.approval_status || 'draft';
      return `
        <tr>
          <td style="font-weight:700;color:var(--gray-900);">${rider.full_name || 'Rider #' + rider.id}<br><span style="font-weight:500;color:var(--gray-400);font-size:12px;">${rider.email || rider.phone_number || 'No account contact'}</span></td>
          <td>${rider.phone_number || 'N/A'}</td>
          <td>${vehicleLabel(rider)}</td>
          <td><span class="badge ${docs >= 6 ? 'badge-active' : docs > 0 ? 'badge-verified' : 'badge-inactive'}">${docs}/6 docs</span></td>
          <td><span class="badge ${statusBadge(status)}">${statusLabel(status)}</span></td>
          <td>${formatDate(rider.submitted_at || rider.updated_at)}</td>
          <td style="text-align:center;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button class="action-btn" onclick="showRiderReviewDetails(${rider.id})">View</button>
            ${status !== 'approved' ? `<button class="action-btn" onclick="updateRiderReviewStatus(${rider.id}, 'approved')">Approve</button>` : ''}
            ${status !== 'rejected' ? `<button class="action-btn" onclick="promptRejectRider(${rider.id})" style="color:var(--red-600);">Reject</button>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  function filterRiders(filter, button) {
    riderFilter = filter;
    document.querySelectorAll('.pill').forEach((pill) => pill.classList.remove('active'));
    if (button) button.classList.add('active');
    loadRiderReviews();
  }

  function searchRiders(query) { riderQuery = query; renderRiders(); }

  async function showRiderReviewDetails(riderId) {
    try {
      const result = await apiClient.get(endpoints.admin.riderReview(riderId));
      const rider = result.data;
      const docRow = (label, value) => `<div class="check-item"><div class="check-box">${value ? '✓' : '!'}</div><div><div class="check-title">${label}</div><div class="check-copy">${value || 'Not uploaded'}</div></div></div>`;
      const content = `<div style="display:grid;gap:12px;"><p><strong>${rider.full_name || 'Rider #' + rider.id}</strong></p><p>Status: <strong>${statusLabel(rider.approval_status)}</strong></p><p>Vehicle: ${vehicleLabel(rider)}</p><p>National ID: ${rider.national_id_number || 'N/A'}</p><div class="checklist">${docRow('National ID front', rider.national_id_front_url)}${docRow('National ID back', rider.national_id_back_url)}${docRow('Profile photo', rider.profile_photo_url)}${docRow('Driving licence', rider.driving_licence_image_url)}${docRow('Permit image', rider.permit_image_url)}${docRow('Vehicle photo', rider.vehicle_photo_url)}</div>${rider.review_note ? `<p><strong>Review note:</strong> ${rider.review_note}</p>` : ''}</div>`;
      if (typeof openModal === 'function') {
        openModal('Rider review details', content, ['<button class="btn-outline" onclick="closeModal()">Close</button>', `<button class="btn-primary" onclick="updateRiderReviewStatus(${rider.id}, 'approved')">Approve</button>`, `<button class="btn-outline" onclick="promptRejectRider(${rider.id})">Reject</button>`]);
        return;
      }
      alert(`Rider ${rider.id}: ${statusLabel(rider.approval_status)}`);
    } catch (error) {
      if (typeof showToast === 'function') showToast(error.message || 'Could not load rider details', 'error');
    }
  }

  async function updateRiderReviewStatus(riderId, approvalStatus, reviewNote = null) {
    try {
      await apiClient.put(endpoints.admin.riderReviewStatus(riderId), { approval_status: approvalStatus, review_note: reviewNote });
      if (typeof closeModal === 'function') closeModal();
      if (typeof showToast === 'function') showToast(`Rider ${statusLabel(approvalStatus).toLowerCase()}`);
      await loadRiderReviews();
    } catch (error) {
      if (typeof showToast === 'function') showToast(error.message || 'Could not update rider review', 'error');
    }
  }

  function promptRejectRider(riderId) {
    const form = `<div style="display:grid;gap:12px;"><p>Give a clear reason so the rider knows what to correct.</p><textarea id="riderRejectNote" class="form-input" rows="4" placeholder="Example: Licence image is unclear."></textarea></div>`;
    if (typeof openModal === 'function') {
      openModal('Reject rider profile', form, ['<button class="btn-outline" onclick="closeModal()">Cancel</button>', `<button class="btn-primary" onclick="submitRejectRider(${riderId})">Reject rider</button>`]);
      return;
    }
    const note = prompt('Reason for rejection');
    if (note) updateRiderReviewStatus(riderId, 'rejected', note);
  }

  function submitRejectRider(riderId) {
    const note = document.getElementById('riderRejectNote')?.value?.trim();
    if (!note) {
      if (typeof showToast === 'function') showToast('Review note is required for rejection', 'error');
      return;
    }
    updateRiderReviewStatus(riderId, 'rejected', note);
  }

  function showRiderBlueprint() {
    const content = `<div style="display:grid;gap:12px;"><p><strong>Parent flow:</strong> account creation, OTP verification, child registration, emergency contact, guardian list, consent capture.</p><p><strong>Rider flow:</strong> account creation, document upload, verification authorization, manual review, physical verification.</p><p><strong>Watch flow:</strong> backend-controlled state, location updates, SOS eventing, QR verification token, offline queue.</p></div>`;
    if (typeof openModal === 'function') { openModal('Onboarding blueprint', content, ['<button class="btn-outline" onclick="closeModal()">Close</button>']); return; }
    alert('Onboarding blueprint: parent flow, rider flow, and watch flow.');
  }

  function showWearableSpec() {
    const content = `<div style="display:grid;gap:12px;"><p><strong>GET</strong> /api/watch/state/{deviceId}</p><p><strong>POST</strong> /api/watch/location</p><p><strong>POST</strong> /api/watch/event</p><p><strong>POST</strong> /api/watch/verification-token</p><p><strong>POST</strong> /api/trips/verify-watch</p></div>`;
    if (typeof openModal === 'function') { openModal('Wearable endpoints', content, ['<button class="btn-outline" onclick="closeModal()">Close</button>']); return; }
    alert('Wearable endpoints: state, location, event, verification token, and QR verification.');
  }

  function handleAddRider() {
    const form = `<form class="modal-form"><div class="form-group"><label class="form-label">Full name</label><input class="form-input" placeholder="Enter rider name" /></div><div class="form-group"><label class="form-label">National ID</label><input class="form-input" placeholder="National ID number" /></div><div class="form-group"><label class="form-label">Phone number</label><input class="form-input" placeholder="+256 ..." /></div><div class="form-group"><label class="form-label">Stage / Association</label><input class="form-input" placeholder="Stage or association" /></div></form>`;
    if (typeof openModal === 'function') { openModal('Register rider', form, ['<button class="btn-outline" onclick="closeModal()">Cancel</button>', '<button class="btn-primary" onclick="showToast(\'Rider registration drafted\'); closeModal();">Save draft</button>']); return; }
    alert('Register rider flow.');
  }

  loadRiderReviews();
</script>
