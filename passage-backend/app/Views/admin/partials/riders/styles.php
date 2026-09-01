<style>
.page-shell {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .page-header-left {
    max-width: 760px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--green-50);
    color: var(--green-700);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .page-title {
    margin-top: 12px;
    font-size: 30px;
    line-height: 1.05;
    font-weight: 800;
    color: var(--gray-900);
  }

  .page-subtitle {
    margin-top: 10px;
    max-width: 680px;
    color: var(--gray-600);
    font-size: 14px;
    line-height: 1.7;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .btn-primary,
  .btn-outline,
  .chip-action,
  .action-btn {
    font-family: inherit;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--green-700), var(--green-500));
    color: var(--passage-white);
    padding: 11px 16px;
    border-radius: 12px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    box-shadow: 0 10px 24px rgba(15, 110, 86, 0.16);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(15, 110, 86, 0.2);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--passage-white);
    color: var(--gray-700);
    padding: 11px 16px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid var(--gray-200);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .btn-outline:hover {
    background: var(--gray-50);
    border-color: var(--gray-200);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .stat-card,
  .panel-card {
    background: var(--passage-white);
    border: 1px solid var(--gray-100);
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(15, 17, 23, 0.04);
  }

  .stat-card {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 132px;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stat-value {
    font-size: 30px;
    line-height: 1;
    font-weight: 800;
    color: var(--gray-900);
  }

  .stat-meta {
    font-size: 12px;
    color: var(--gray-600);
    line-height: 1.55;
  }

  .stat-card.hero {
    background: linear-gradient(135deg, var(--green-900), var(--green-700));
    border-color: transparent;
  }

  .stat-card.hero .stat-label,
  .stat-card.hero .stat-meta,
  .stat-card.hero .stat-value {
    color: var(--passage-white);
  }

  .stat-card.hero .stat-meta {
    opacity: 0.86;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 14px;
  }

  .panel-card {
    overflow: hidden;
  }

  .panel-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--gray-900);
  }

  .panel-subtitle {
    margin-top: 6px;
    color: var(--gray-600);
    font-size: 13px;
    line-height: 1.55;
  }

  .panel-body {
    padding: 20px;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .flow-step {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--gray-100);
  }

  .flow-step:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .flow-step:first-child {
    padding-top: 0;
  }

  .step-badge {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--green-50);
    color: var(--green-700);
    font-weight: 800;
    font-size: 13px;
    flex-shrink: 0;
  }

  .step-title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--gray-900);
  }

  .step-copy {
    margin-top: 4px;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--gray-600);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip,
  .chip-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 7px 11px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid var(--gray-200);
    background: var(--passage-white);
    color: var(--gray-700);
  }

  .chip-action {
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }

  .chip-action:hover {
    background: var(--green-50);
    border-color: var(--green-100);
    transform: translateY(-1px);
  }

  .chip-success {
    background: var(--passage-success-bg);
    border-color: var(--passage-success-border);
    color: var(--passage-success-text);
  }

  .chip-warning {
    background: var(--amber-50);
    border-color: var(--passage-warning-border);
    color: var(--amber-600);
  }

  .chip-info {
    background: var(--blue-50);
    border-color: var(--passage-info-border);
    color: var(--blue-600);
  }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .endpoint-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .endpoint-card {
    border: 1px solid var(--gray-100);
    border-radius: 16px;
    padding: 16px;
    background: linear-gradient(180deg, var(--passage-white), var(--passage-surface-subtle));
  }

  .endpoint-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .endpoint-method {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .method-get {
    background: var(--blue-50);
    color: var(--passage-info-strong);
  }

  .method-post {
    background: var(--passage-success-bg);
    color: var(--passage-success-text);
  }

  .endpoint-path {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--green-700);
    word-break: break-word;
  }

  .endpoint-copy {
    margin-top: 10px;
    font-size: 12.5px;
    color: var(--gray-600);
    line-height: 1.65;
  }

  .endpoint-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .meta-pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--gray-50);
    color: var(--gray-700);
    font-size: 11px;
    font-weight: 700;
  }

  .timeline {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .timeline-item {
    min-width: 132px;
    flex: 1 1 132px;
    border: 1px solid var(--gray-100);
    border-radius: 14px;
    padding: 12px;
    background: var(--passage-white);
  }

  .timeline-item.active {
    border-color: var(--green-100);
    background: linear-gradient(180deg, var(--green-50), var(--passage-white));
  }

  .timeline-item p:first-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--gray-400);
    text-transform: uppercase;
  }

  .timeline-item p:last-child {
    margin-top: 6px;
    font-size: 12.5px;
    line-height: 1.5;
    font-weight: 700;
    color: var(--gray-900);
  }

  .state-matrix {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    font-size: 12.5px;
  }

  .state-matrix th,
  .state-matrix td {
    padding: 11px 12px;
    border-bottom: 1px solid var(--gray-100);
    vertical-align: top;
    text-align: left;
  }

  .state-matrix th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--gray-400);
    font-weight: 800;
    background: var(--gray-50);
  }

  .state-matrix td:first-child {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    color: var(--green-700);
    font-weight: 700;
  }

  .state-matrix tr:last-child td {
    border-bottom: none;
  }

  .access-list {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .access-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 12px;
    align-items: start;
    padding: 12px 14px;
    border: 1px solid var(--gray-100);
    border-radius: 14px;
    background: var(--passage-white);
  }

  .access-label {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--gray-400);
  }

  .access-copy {
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--gray-600);
  }

  .checklist {
    display: grid;
    gap: 10px;
  }

  .check-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    border: 1px solid var(--gray-100);
    border-radius: 14px;
    background: var(--passage-white);
  }

  .check-box {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    margin-top: 2px;
    border: 1.5px solid var(--green-200);
    background: var(--green-50);
    color: var(--green-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .check-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--gray-900);
  }

  .check-copy {
    margin-top: 4px;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--gray-600);
  }

  .table-card {
    background: var(--passage-white);
    border: 1px solid var(--gray-100);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(15, 17, 23, 0.04);
  }

  .table-toolbar {
    padding: 14px 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pill-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .pill {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--gray-200);
    background: var(--passage-white);
    color: var(--gray-600);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }

  .pill.active,
  .pill:hover {
    background: var(--green-500);
    border-color: var(--green-500);
    color: var(--passage-white);
  }

  .table-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    background: var(--gray-50);
  }

  .table-search input {
    border: none;
    background: none;
    outline: none;
    width: 220px;
    font-family: inherit;
    font-size: 13px;
    color: var(--gray-900);
  }

  .table-search input::placeholder {
    color: var(--gray-400);
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .rider-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .rider-table thead tr {
    background: var(--gray-50);
  }

  .rider-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--gray-400);
    border-bottom: 1px solid var(--gray-100);
    white-space: nowrap;
  }

  .rider-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-600);
    vertical-align: middle;
  }

  .rider-table tbody tr:hover td {
    background: var(--gray-50);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
  }

  .badge-active {
    background: var(--passage-success-bg);
    color: var(--passage-success-text);
  }

  .badge-inactive {
    background: var(--passage-neutral-bg);
    color: var(--passage-neutral-text);
  }

  .badge-verified {
    background: var(--passage-indigo-bg);
    color: var(--passage-indigo-text);
  }

  .action-btn {
    color: var(--green-500);
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    font-size: 13px;
    padding: 0;
  }

  .action-btn:hover {
    color: var(--green-700);
    text-decoration: underline;
  }

  .table-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    color: var(--gray-600);
    font-size: 13px;
  }

  .footer-meta {
    color: var(--gray-400);
  }

  @media (max-width: 1180px) {
    .stats-grid,
    .content-grid,
    .section-grid,
    .endpoint-grid {
      grid-template-columns: 1fr;
    }

    .table-search input {
      width: 160px;
    }
  }
</style>
