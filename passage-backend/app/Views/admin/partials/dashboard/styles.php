<style>
  /* ── shared tokens ── */
  :root {
    --green-50: #E1F5EE;
    --green-100: #9FE1CB;
    --green-200: #5DCAA5;
    --green-500: #1D9E75;
    --green-700: #0F6E56;
    --green-900: #085041;
    --gray-50: #F7F8F9;
    --gray-100: #EFF0F2;
    --gray-200: #E0E2E6;
    --gray-400: #9EA3AF;
    --gray-600: #5C6270;
    --gray-900: #0F1117;
    --red-50: #FCEBEB;
    --red-100: #F7C1C1;
    --red-600: #A32D2D;
    --amber-50: #FAEEDA;
    --amber-600: #854F0B;
    --blue-50: #E6F1FB;
    --blue-600: #185FA5;
  }

  /* ── stat cards ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border: 1px solid var(--gray-100);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat-card.hero {
    background: var(--green-700);
    border-color: var(--green-700);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--gray-400);
  }

  .hero .stat-label {
    color: var(--green-100);
  }

  .stat-val {
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
    color: var(--gray-900);
  }

  .hero .stat-val {
    color: #fff;
  }

  .stat-sub {
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sub-up {
    color: var(--green-500);
  }

  .sub-mute {
    color: var(--gray-400);
  }

  .hero .stat-sub {
    color: var(--green-100);
  }

  /* ── mid row ── */
  .mid-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 14px;
    margin-bottom: 20px;
  }

  /* ── cards ── */
  .card {
    background: #fff;
    border: 1px solid var(--gray-100);
    border-radius: 12px;
    overflow: hidden;
  }

  .card-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-900);
  }

  .card-meta {
    font-size: 12px;
    color: var(--gray-400);
  }

  /* ── bar chart ── */
  .bar-chart {
    padding: 16px 20px 12px;
  }

  .bars {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    height: 96px;
    margin-bottom: 6px;
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .bar-fill {
    width: 100%;
    border-radius: 4px 4px 0 0;
    transition: opacity .15s;
    cursor: default;
  }

  .bar-fill:hover {
    opacity: .8;
  }

  .bar-day {
    font-size: 11px;
    color: var(--gray-400);
  }

  .chart-stats {
    display: flex;
    gap: 20px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--gray-100);
  }

  .cs-item p:first-child {
    font-size: 11px;
    color: var(--gray-400);
  }

  .cs-item p:last-child {
    font-size: 15px;
    font-weight: 600;
    color: var(--gray-900);
  }

  /* ── alerts ── */
  .alert-row {
    display: flex;
    gap: 12px;
    padding: 13px 20px;
    border-bottom: 1px solid var(--gray-100);
  }

  .alert-row:last-child {
    border-bottom: none;
  }

  .a-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .a-dot.red {
    background: #E24B4A;
  }

  .a-dot.amber {
    background: #EF9F27;
  }

  .a-dot.blue {
    background: #378ADD;
  }

  .a-body p:first-child {
    font-size: 12.5px;
    color: var(--gray-900);
    line-height: 1.45;
  }

  .a-body p:last-child {
    font-size: 11px;
    color: var(--gray-400);
    margin-top: 3px;
  }

  .see-all-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 20px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--green-500);
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    border-top: 1px solid var(--gray-100);
    width: 100%;
  }

  /* ── pill filters ── */
  .pill-row {
    display: flex;
    gap: 6px;
  }

  .pill {
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--gray-200);
    background: #fff;
    color: var(--gray-600);
    cursor: pointer;
    font-family: inherit;
    transition: all .15s;
  }

  .pill:hover {
    background: var(--gray-50);
  }

  .pill.active {
    background: var(--green-500);
    border-color: var(--green-500);
    color: #fff;
  }

  /* ── table ── */
  .ride-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .ride-table thead tr {
    background: var(--gray-50);
  }

  .ride-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--gray-400);
    border-bottom: 1px solid var(--gray-100);
  }

  .ride-table td {
    padding: 12px 16px;
    color: var(--gray-600);
    border-bottom: 1px solid var(--gray-100);
    vertical-align: middle;
  }

  .ride-table tbody tr:last-child td {
    border-bottom: none;
  }

  .ride-table tbody tr:hover td {
    background: var(--gray-50);
  }

  .ride-table tbody tr.row-progress td {
    background: #FFFBF0;
  }

  .ride-table tbody tr.row-pending td {
    background: #FFF8F8;
  }

  .ride-id {
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    font-size: 12px;
    color: var(--green-500);
  }

  .ride-name {
    font-weight: 600;
    color: var(--gray-900);
  }

  .plate {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-assigned {
    background: var(--green-50);
    color: var(--green-700);
  }

  .badge-progress {
    background: var(--amber-50);
    color: var(--amber-600);
  }

  .badge-pending {
    background: var(--red-50);
    color: var(--red-600);
  }

  .badge-done {
    background: var(--blue-50);
    color: var(--blue-600);
  }

  .view-btn {
    font-size: 12px;
    font-weight: 600;
    color: var(--green-500);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .view-btn:hover {
    text-decoration: underline;
  }

  /* ── table toolbar ── */
  .table-toolbar {
    padding: 14px 20px;
    border-bottom: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .table-search {
    display: flex;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 7px 12px;
    background: var(--gray-50);
  }

  .table-search input {
    border: none;
    background: none;
    outline: none;
    font-size: 12.5px;
    color: var(--gray-900);
    font-family: inherit;
    width: 190px;
  }

  .table-search input::placeholder {
    color: var(--gray-400);
  }

  /* ── pagination ── */
  .pagination {
    padding: 12px 20px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pag-info {
    font-size: 12px;
    color: var(--gray-400);
  }

  .pag-btns {
    display: flex;
    gap: 5px;
  }

  .pag-btn {
    padding: 5px 11px;
    font-size: 12px;
    border: 1px solid var(--gray-200);
    border-radius: 6px;
    background: #fff;
    color: var(--gray-600);
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
  }

  .pag-btn:hover {
    background: var(--gray-50);
  }

  .pag-btn.active {
    background: var(--green-500);
    border-color: var(--green-500);
    color: #fff;
    font-weight: 600;
  }

  /* ── action btns ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--green-500);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
  }

  .btn-primary:hover {
    background: var(--green-700);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    color: var(--gray-600);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
  }

  .btn-outline:hover {
    background: var(--gray-50);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .page-header-left p:first-child {
    font-size: 20px;
    font-weight: 700;
    color: var(--gray-900);
  }

  .page-header-left p:last-child {
    font-size: 13px;
    color: var(--gray-400);
    margin-top: 2px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
</style>
