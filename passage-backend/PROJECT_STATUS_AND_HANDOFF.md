# PASSAGE Backend Status and Handoff

Updated: 2026-07-22

## Current state

Backend implementation is complete through the Phase 9 code scope. The TypeScript build passed after the latest wallet/payment work. Live end-to-end verification remains blocked by hosted MySQL access and external provider configuration.

The application mounts APIs under `/api` and `/api/v1`; confirm the exact deployment prefix before configuring the Flutter `API_BASE_URL`.

## Major implemented areas

- JWT authentication, registration, login, phone OTP request/verification, and sanitized user responses.
- Parent child and safety-profile data.
- Rider compliance fields, document metadata, availability, approval gates, and admin review/audit endpoints.
- Approved-rider matching, active ride requests, accept, decline/reassignment, and cancellation.
- Trip creation, pickup/start, live state, drop-off/completion, cancellation, and ride-request synchronization.
- Device authentication and database-backed, hashed, short-lived, single-use watch verification tokens.
- Backend-only OpenRouteService proxy with caching and route fallback.
- User-scoped in-app notifications with read/unread behavior and lifecycle event creation.
- Wallet balances and transactions, payment tracking, idempotent top-up crediting, server-owned fares, atomic parent debit/rider credit settlement, and payout reservation.
- Collecto adapter configuration validation and timeout handling.

## Recent migrations

- `018_extend_riders_compliance_profile.sql`
- `019_add_rider_document_metadata.sql`
- `020_add_rider_review_audit.sql`
- `021_add_trip_lifecycle_status.sql`
- `022_add_watch_verification_tokens.sql`
- `023_extend_notifications_in_app.sql`
- `024_add_wallets_and_payment_tracking.sql`

These migrations are implemented in the repository but have not been verified on the hosted database. The expected hosted database is `passagem_app`.

`database/passage_schema_phpmyadmin.sql` is a consolidated fresh-database schema. It drops/recreates tables and must not be imported over valuable data without approval and a backup.

## Current blockers and limitations

- Hosted MySQL is reachable but rejects the configured account with `ER_ACCESS_DENIED_ERROR`.
- The database owner must confirm the exact MySQL user, attach it to `passagem_app` with privileges, and configure remote-host access where needed.
- The older sandbox at `https://mariam.cissytech.com/api` did not expose all routes in this repository, including registration/OTP during the last verification.
- Real SMS/OTP delivery needs valid SMS configuration and a current backend deployment.
- The merchant account must confirm whether Collecto uses the legacy username contract or the advertised v2.1 contract.
- Payout requests currently reserve funds and remain pending for provider/admin processing.
- Rider documents store metadata/mock URLs; production binary storage is not implemented.
- The backend package currently has no automated test suite; `npm test` is only a placeholder.
- Live DB, device/watch, ORS, notification, top-up, settlement, and payout tests are still required.

## Safe configuration

Use `.env.example` as the variable-name reference. Never commit real values for database credentials, JWT/TOKEN secrets, Collecto, SMS, FCM, mailer, or routing providers.

## Verification and setup commands

```powershell
npm install
npm run build
npm run dev
```

After database access is fixed:

```powershell
npm run db:migrate
npm run db:seed
```

Review migration state before using `npm run db:setup`, particularly on a non-empty database.

## Documentation note

`API_SPECIFICATION.md` and parts of `README.md` describe the original API surface and do not yet enumerate every Phase 5-9 route. The authoritative implementation is the current route/controller code plus the frontend documents:

- `passage_frontend/docs/backend_integration_plan.md`
- `passage_frontend/docs/backend_endpoint_mapping.md`
- this status file

## Next work: production readiness

1. Correct MySQL/cPanel permissions and verify migrations through `024`.
2. Deploy this backend version behind HTTPS.
3. Validate auth/OTP, rider review, assignment, watch verification, trip lifecycle, notifications, wallets, payment verification, settlement, and payouts against live services.
4. Add backend automated integration tests.
5. Complete authorization, CORS, rate limiting, secrets rotation, structured logging, monitoring, backups, and recovery checks.
