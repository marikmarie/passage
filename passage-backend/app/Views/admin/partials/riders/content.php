<div class="page-shell">
  <div class="page-header">
    <div class="page-header-left">
      <span class="eyebrow"><i class="ti ti-route"></i> Onboarding and watch control</span>
      <h2 class="page-title">Parent, Rider, and Wearable Operations</h2>
      <p class="page-subtitle">
        This view turns the onboarding framework and the watch backend contract into a working admin design:
        parent-led child registration, rider verification, device state control, location ingestion, and consent tracking.
      </p>
    </div>
    <div class="header-actions">
      <button class="btn-primary" onclick="handleAddRider()"><i class="ti ti-user-plus"></i> Register rider</button>
      <button class="btn-outline" onclick="showRiderBlueprint()"><i class="ti ti-file-description"></i> Review flow</button>
      <button class="btn-outline" onclick="showWearableSpec()"><i class="ti ti-device-watch"></i> Watch endpoints</button>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card hero">
      <div class="stat-icon" style="background:rgba(255,255,255,.14);color:#fff;">
        <i class="ti ti-shield-check"></i>
      </div>
      <div class="stat-label">Parent-led onboarding</div>
      <div class="stat-value">4 steps</div>
      <div class="stat-meta">Account creation, child registration, emergency contact, and authorized guardians.</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--green-50);color:var(--green-700);">
        <i class="ti ti-user-check"></i>
      </div>
      <div class="stat-label">Rider onboarding</div>
      <div class="stat-value">3 steps</div>
      <div class="stat-meta">Registration, document upload, and verification authorization before approval.</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--blue-50);color:var(--blue-600);">
        <i class="ti ti-device-watch"></i>
      </div>
      <div class="stat-label">Watch endpoints</div>
      <div class="stat-value">5 APIs</div>
      <div class="stat-meta">State, location, events, verification token, and QR verification flow.</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--amber-50);color:var(--amber-600);">
        <i class="ti ti-scan"></i>
      </div>
      <div class="stat-label">Polling cadence</div>
      <div class="stat-value">10-60s</div>
      <div class="stat-meta">Adjusted by trip urgency, SOS state, battery level, and offline behavior.</div>
    </div>
  </div>

  <div class="content-grid">
    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Parent onboarding flow</div>
          <div class="panel-subtitle">The parent owns the child profile and consent record. This flow should capture identity, child data, emergency contacts, and legal acknowledgements before activation.</div>
        </div>
        <span class="chip chip-success">Parent-led</span>
      </div>
      <div class="panel-body stack">
        <div class="flow-step">
          <div class="step-badge">1</div>
          <div>
            <div class="step-title">Parent account creation</div>
            <div class="step-copy">Collect full name, national ID, phone number, alternative phone, and email. Verify the phone number by OTP before the account is considered active.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-action">Full name</span>
              <span class="chip chip-action">National ID</span>
              <span class="chip chip-action">Phone + OTP</span>
              <span class="chip chip-action">Email</span>
            </div>
          </div>
        </div>

        <div class="flow-step">
          <div class="step-badge">2</div>
          <div>
            <div class="step-title">Child registration</div>
            <div class="step-copy">Capture first and last name, date of birth, gender, school name, location, class or grade, and a passport photo. Allow optional school ID upload or an unavailable flag.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-action">Child photo</span>
              <span class="chip chip-action">School details</span>
              <span class="chip chip-action">Class / Grade</span>
              <span class="chip chip-action">School doc</span>
            </div>
          </div>
        </div>

        <div class="flow-step">
          <div class="step-badge">3</div>
          <div>
            <div class="step-title">Emergency contact</div>
            <div class="step-copy">Store a single emergency contact with full name, relationship, and phone number. Use this only when the parent cannot be reached.</div>
          </div>
        </div>

        <div class="flow-step">
          <div class="step-badge">4</div>
          <div>
            <div class="step-title">Authorized guardians</div>
            <div class="step-copy">Support one or more pickup-authorized guardians with full name, relationship, and phone number. This list should be editable and auditable.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-info">Optional</span>
              <span class="chip chip-info">Auditable</span>
              <span class="chip chip-info">Pickup only</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Legal and consent controls</div>
          <div class="panel-subtitle">The UI should capture policy acknowledgements, consent, and a durable versioned record of acceptance for both parent and rider paths.</div>
        </div>
        <span class="chip chip-warning">Versioned</span>
      </div>
      <div class="panel-body">
        <div class="checklist">
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Terms and policy acknowledgement</div>
              <div class="check-copy">Store checked acknowledgements for Terms of Service, Privacy Notice, and Child Data Protection Notice with timestamp and policy version.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Parent consent statement</div>
              <div class="check-copy">Record that the parent is legally responsible, the information is accurate, and PASSAGE may process data for transportation and safety.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Rider verification authorization</div>
              <div class="check-copy">Capture consent for verification checks, community vetting, and a note that approval depends on compliance with onboarding requirements.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Audit trail and version history</div>
              <div class="check-copy">Persist who accepted what, when, and which document version was shown so policy updates do not require schema changes later.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Privacy and access boundaries</div>
          <div class="panel-subtitle">The design should make it obvious which information is available to parents, riders, and admins so the UX does not leak protected child data.</div>
        </div>
        <span class="chip chip-warning">Role-aware</span>
      </div>
      <div class="panel-body">
        <div class="access-list">
          <div class="access-row">
            <div class="access-label">Parent</div>
            <div class="access-copy">Can view and edit child profile data, emergency contacts, authorized guardians, and consent history. Parent owns the account and the related child record.</div>
          </div>
          <div class="access-row">
            <div class="access-label">Rider</div>
            <div class="access-copy">Must not see child full name, photo, date of birth, parent details, school documents, or emergency contact information. Rider only sees the minimum safe transport display.</div>
          </div>
          <div class="access-row">
            <div class="access-label">Admin</div>
            <div class="access-copy">Can update verification records, review consent acknowledgements, and inspect operational data for support and safety purposes.</div>
          </div>
          <div class="access-row">
            <div class="access-label">Watch display</div>
            <div class="access-copy">Should show only the current state and the minimum ride-safe context. Child navigation must remain backend-driven at all times.</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="content-grid">
    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Rider onboarding flow</div>
          <div class="panel-subtitle">Use this workflow for the rider account, identity documents, and verification permission before the rider enters physical screening.</div>
        </div>
        <span class="chip chip-info">Pre-qualified</span>
      </div>
      <div class="panel-body stack">
        <div class="flow-step">
          <div class="step-badge">1</div>
          <div>
            <div class="step-title">Rider account creation</div>
            <div class="step-copy">Collect full name, national ID, phone number, alternative phone, date of birth, residential area, stage or boda association, and years of commercial riding experience.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-action">Experience</span>
              <span class="chip chip-action">Stage / Association</span>
              <span class="chip chip-action">Residence</span>
            </div>
          </div>
        </div>

        <div class="flow-step">
          <div class="step-badge">2</div>
          <div>
            <div class="step-title">Identity document upload</div>
            <div class="step-copy">Support camera capture and file upload for national ID front, national ID back, passport photo, and driving permit. The UX should make the accepted formats obvious before submission.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-action">ID front</span>
              <span class="chip chip-action">ID back</span>
              <span class="chip chip-action">Passport photo</span>
              <span class="chip chip-action">Driving permit</span>
            </div>
          </div>
        </div>

        <div class="flow-step">
          <div class="step-badge">3</div>
          <div>
            <div class="step-title">Verification authorization</div>
            <div class="step-copy">Capture consent for verification checks, then move the rider to a pre-qualified state for community vetting, manual review, and physical verification scheduling.</div>
            <div class="chip-row" style="margin-top:10px;">
              <span class="chip chip-warning">Manual review</span>
              <span class="chip chip-warning">Vetting</span>
              <span class="chip chip-warning">Physical verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Watch state model</div>
          <div class="panel-subtitle">The backend controls the watch screen. The child should not manually navigate ride states.</div>
        </div>
        <span class="chip chip-success">Source of truth</span>
      </div>
      <div class="panel-body stack">
        <div class="timeline">
          <div class="timeline-item active"><p>1</p><p>IDLE_READY</p></div>
          <div class="timeline-item"><p>2</p><p>RIDE_ASSIGNED</p></div>
          <div class="timeline-item"><p>3</p><p>DRIVER_NEARBY</p></div>
          <div class="timeline-item"><p>4</p><p>AWAITING_VERIFICATION</p></div>
          <div class="timeline-item"><p>5</p><p>PICKUP_CONFIRMED</p></div>
          <div class="timeline-item"><p>6</p><p>IN_TRANSIT</p></div>
          <div class="timeline-item"><p>7</p><p>DROPOFF_CONFIRMED</p></div>
          <div class="timeline-item"><p>8</p><p>SOS_ACTIVE</p></div>
          <div class="timeline-item"><p>9</p><p>LOW_BATTERY</p></div>
          <div class="timeline-item"><p>10</p><p>OFFLINE</p></div>
        </div>
        <table class="state-matrix" aria-label="Watch states and cadence">
          <thead>
            <tr>
              <th>State</th>
              <th>What the watch shows</th>
              <th>Suggested cadence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IDLE_READY</td>
              <td>Ready screen, no active trip context.</td>
              <td>Poll every 2-5 minutes.</td>
            </tr>
            <tr>
              <td>RIDE_ASSIGNED / DRIVER_NEARBY</td>
              <td>Prepare for pickup and show trip warning or QR readiness.</td>
              <td>Poll every 30-60 seconds.</td>
            </tr>
            <tr>
              <td>AWAITING_VERIFICATION</td>
              <td>Show the token or QR verification state.</td>
              <td>Poll every 30 seconds or less.</td>
            </tr>
            <tr>
              <td>IN_TRANSIT</td>
              <td>Active ride progress and live tracking context.</td>
              <td>Poll every 10-30 seconds.</td>
            </tr>
            <tr>
              <td>SOS_ACTIVE</td>
              <td>Emergency screen with heightened attention state.</td>
              <td>Poll every 5-10 seconds.</td>
            </tr>
            <tr>
              <td>LOW_BATTERY / OFFLINE</td>
              <td>Safety notice, queue local updates, preserve trip context.</td>
              <td>Retry quickly and replay saved data on reconnect.</td>
            </tr>
          </tbody>
        </table>
        <div class="chip-row">
          <span class="chip chip-success">State polling</span>
          <span class="chip chip-success">Auto screen change</span>
          <span class="chip chip-success">Single-use token</span>
          <span class="chip chip-success">Offline queue</span>
        </div>
        <div class="checklist" style="margin-top:2px;">
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">No trip, ride assigned, active trip, SOS, and drop-off each need different location frequency</div>
              <div class="check-copy">Tune polling and upload cadence to trip urgency: slower when idle, faster during active trip or SOS, and send one final location at drop-off.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Offline-safe behavior</div>
              <div class="check-copy">Save location updates locally, show an offline screen, preserve active trip data, and synchronize once connectivity returns.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="panel-card">
    <div class="panel-header">
      <div>
        <div class="panel-title">Wearable API contract</div>
        <div class="panel-subtitle">These endpoints are the minimum backend surface required for the watch to remain mostly non-interactive while still reporting location and events.</div>
      </div>
      <span class="chip chip-info">DEVICE_TOKEN</span>
    </div>
    <div class="panel-body">
      <div class="endpoint-grid">
        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-get">GET</span>
            <span class="chip chip-info">Watch screen state</span>
          </div>
          <div class="endpoint-path">/api/watch/state/{deviceId}</div>
          <div class="endpoint-copy">Returns the current watch screen, trip context, and the polling interval. This endpoint controls the UI the watch displays.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Auth: Bearer DEVICE_TOKEN</span>
            <span class="meta-pill">Source of truth</span>
          </div>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-post">POST</span>
            <span class="chip chip-info">Location stream</span>
          </div>
          <div class="endpoint-path">/api/watch/location</div>
          <div class="endpoint-copy">Accepts lat, lng, accuracy, speed, bearing, battery, timestamp, deviceId, and tripId. This should be the main telemetry feed from the watch.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Auth: Bearer DEVICE_TOKEN</span>
            <span class="meta-pill">Offline queue</span>
          </div>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-post">POST</span>
            <span class="chip chip-warning">Events</span>
          </div>
          <div class="endpoint-path">/api/watch/event</div>
          <div class="endpoint-copy">Used for SOS and low-battery events. The backend should store the event, update the trip state, and trigger any required alerts.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Auth: Bearer DEVICE_TOKEN</span>
            <span class="meta-pill">SOS_TRIGGERED</span>
          </div>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-post">POST</span>
            <span class="chip chip-warning">QR token</span>
          </div>
          <div class="endpoint-path">/api/watch/verification-token</div>
          <div class="endpoint-copy">Creates a short-lived, signed, single-use verification token that the watch converts into a QR image for rider confirmation.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Auth: Bearer DEVICE_TOKEN</span>
            <span class="meta-pill">Short-lived</span>
          </div>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-post">POST</span>
            <span class="chip chip-success">Rider app verify</span>
          </div>
          <div class="endpoint-path">/api/trips/verify-watch</div>
          <div class="endpoint-copy">Used by the rider app to verify the QR token, confirm the pickup action, and move the watch state to pickup confirmed.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Auth: Bearer RIDER_TOKEN</span>
            <span class="meta-pill">Single-use</span>
          </div>
        </div>

        <div class="endpoint-card">
          <div class="endpoint-top">
            <span class="endpoint-method method-get">RULE</span>
            <span class="chip chip-success">Offline handling</span>
          </div>
          <div class="endpoint-path">No heartbeat endpoint required</div>
          <div class="endpoint-copy">Battery and connectivity can travel inside location updates. The watch should queue data locally until the connection returns, then replay in order.</div>
          <div class="endpoint-meta">
            <span class="meta-pill">Local storage</span>
            <span class="meta-pill">Replay on reconnect</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="content-grid">
    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Implementation checklist</div>
          <div class="panel-subtitle">Use this as the design and backend backlog for the onboarding and watch experience.</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="checklist">
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Consent records linked to user accounts</div>
              <div class="check-copy">Store parent and rider acknowledgements in a consent table with version, timestamp, actor, and acceptance source.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Policy version management</div>
              <div class="check-copy">Keep legal text in a versioned content model so the app can refresh policy copy without code changes.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Device authentication and rejection rules</div>
              <div class="check-copy">Reject unknown, revoked, or disabled watches at the auth layer before state or location endpoints accept data.</div>
            </div>
          </div>
          <div class="check-item">
            <div class="check-box">✓</div>
            <div>
              <div class="check-title">Operational visibility</div>
              <div class="check-copy">Expose rider status, verification stage, watch state, last location, and active alerts so admins can trace the full onboarding lifecycle.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="panel-header">
        <div>
          <div class="panel-title">Current rider roster</div>
          <div class="panel-subtitle">Keep a simple operational list underneath the design so the page still functions as an admin screen.</div>
        </div>
      </div>
      <div class="panel-body" style="padding:0;">
        <div class="table-toolbar">
          <div class="pill-row">
            <button class="pill active" onclick="filterRiders('all', this)">All</button>
            <button class="pill" onclick="filterRiders('pending_review', this)">Pending review</button>
            <button class="pill" onclick="filterRiders('approved', this)">Approved</button>
            <button class="pill" onclick="filterRiders('rejected', this)">Rejected</button>
            <button class="pill" onclick="filterRiders('suspended', this)">Suspended</button>
          </div>
          <div class="table-search">
            <i class="ti ti-search" style="color:var(--gray-400);font-size:14px;" aria-hidden="true"></i>
            <input type="text" id="riderSearch" placeholder="Search rider, phone, vehicle…" oninput="searchRiders(this.value)" />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="rider-table" aria-label="Riders roster">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Documents</th>
                <th>Review status</th>
                <th>Submitted</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="ridersBody">
              <!-- Rows injected by JS -->
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span id="riderCount">Showing 0 riders</span>
          <span class="footer-meta">Rider verification status controls whether assignments unlock in the rider app.</span>
        </div>
      </div>
    </div>
  </div>
</div>
