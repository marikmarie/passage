# PASSAGE PHP Migration Status and Handoff

Updated: 2026-09-01

## Current state

The active backend is a dependency-free PHP MVC application. The runtime entry point is `public/index.php`; all active routes are defined in `routes/web.php`. No Node/TypeScript runtime or archived implementation remains in the project.

The PHP API serves both `/api/...` and `/api/v1/...`. It preserves the documented JSON response shape, JWT bearer authentication, role checks, device bearer-token authentication, and the key PASSAGE lifecycle rules.

## PHP structure

- `app/Core`: small native router, PDO connection, request/response objects, HMAC JWTs, authorization helpers, and errors.
- `app/Models`: database-backed domain logic for accounts, children, riders, devices, trips, ride requests, tracking, alerts, notifications, subscriptions, payments, and wallets.
- `app/Controllers`: API request handling and web actions.
- `app/Views`: server-rendered PHP views, including the administrator login and dashboard partials.
- `public/assets/admin`: dashboard styles, images, and browser scripts.
- `database/schema.sql`: the single canonical MySQL schema; every table has the `tbl_` prefix.

## Implemented PHP areas

- Registration, login, OTP, sanitized current-user responses, and role-based API access.
- Parent-led child profiles, emergency contacts and guardian fields, consent metadata, document URL metadata, plus child-data access restrictions.
- Rider profile submission, availability, and admin review status.
- Device administration, device-token authentication, watch state, location, SOS and low-battery events, and short-lived single-use watch verification tokens.
- Parent ride requests, approved-rider assignment, accept/decline/cancel flows, and trip creation.
- Pickup and drop-off verification gates, trip start/completion/cancellation, parent and rider notifications, and atomic wallet fare settlement.
- Tracking history and playback, alerts, geofences, subscriptions, payments, wallet payouts, reports, route fallback, and administrative reporting.

## Environment and setup

Use `.env.example` as the variable-name reference. Never commit database credentials or JWT/TOKEN secrets. PHP needs the `pdo_mysql` and `openssl` extensions enabled.

```powershell
php -S 127.0.0.1:8000 -t public public/router.php
```

For a new development database, import `database/schema.sql`. It is the only database definition and creates the required `tbl_*` tables. It stores document references only; a production object-storage upload workflow is still required for binary documents.

## Remaining production work

1. Enable and test `pdo_mysql` in the deployment PHP build, then verify the complete schema against the target MySQL account.
2. Configure a production SMS provider, Collecto contract, and secure external-service credentials.
3. Perform end-to-end tests for onboarding, rider approval, watch verification, trip lifecycle, wallets, payment confirmation, payout processing, and offline watch replay.
4. Add an automated PHP integration suite against an isolated MySQL database.
5. Complete operational controls: explicit CORS allow-list, rate limiting at the web server or gateway, monitoring, backups, recovery testing, and secret rotation.

## Intentional runtime change

The old Socket.IO server was not carried into the plain PHP request/response runtime. Watch and mobile clients use the documented REST state and tracking endpoints. If real-time push is required later, implement it as a separate PHP process with an operational plan rather than reintroducing Node or a framework.
