<!-- MODAL DIALOG -->
<div id="modalDialog" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center;">
  <div style="background:white;border-radius:12px;padding:24px;max-width:500px;width:90%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h2 id="modalTitle" style="font-size:18px;font-weight:700;color:#111827;"></h2>
      <button onclick="closeModal()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#6b7280;">×</button>
    </div>
    <div id="modalContent" style="margin-bottom:20px;color:#4b5563;"></div>
    <div id="modalActions" style="display:flex;gap:8px;justify-content:flex-end;"></div>
  </div>
</div>
