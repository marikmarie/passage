# PASSAGE PHP Backend

PASSAGE is now a dependency-free PHP 8.1+ application using a deliberately small MVC structure:

```text
app/
  Config/       Environment configuration
  Core/         Router, request/response handling, PDO, authentication
  Controllers/  HTTP and API actions
  Models/       MySQL data access and domain rules
  Views/        Server-rendered pages, components, and page partials
public/         Front controller and admin dashboard assets
routes/         API and web route definitions
database/       Canonical PASSAGE MySQL schema
docs/           API reference, handoff notes, and supplied requirements
```

There is no PHP framework, Composer dependency, Node runtime, or build process required to run the application. The active API is served by `public/index.php`, which boots configuration and error handling from `app/bootstrap.php`; controllers return JSON for API endpoints and render PHP views for web endpoints.

## Requirements

- PHP 8.1 or later with `pdo_mysql` and `openssl` enabled.
- MySQL 8.0 or compatible MariaDB.

Check the PHP extensions with:

```powershell
php -m
```

The output must include both `PDO` and `pdo_mysql`.

## Setup

1. Copy `.env.example` to `.env` and set secure `JWT_SECRET` and `TOKEN_SECRET` values, plus the MySQL connection details.

2. For a new development database, import `database/schema.sql`. It is the only schema source and creates all `tbl_*` tables without deleting existing data.

3. Start the development server from this directory:

```powershell
php -S 127.0.0.1:8000 -t public public/router.php
```

4. Open `http://127.0.0.1:8000/api/v1/health` or `http://127.0.0.1:8000/admin`.

For Apache or Nginx, set the document root to `public/`. The supplied `public/.htaccess` forwards application requests to the PHP front controller.

## API compatibility

The PHP routes retain both `/api/...` and `/api/v1/...` prefixes and preserve the standard response envelope:

```json
{
  "success": true,
  "message": "Description",
  "data": {}
}
```

Implemented areas include authentication and OTP, parent and child onboarding, rider profiles and review, device and watch authentication, watch state/location/event/verification flows, ride requests, trip lifecycle, live tracking, alerts, notifications, payments and wallets, subscriptions, reporting, route planning, and admin operations.

The watch flow follows the supplied requirements: device bearer tokens, server-controlled state, location ingestion, SOS and low-battery events, and short-lived, single-use trip verification tokens.

## Safety and privacy rules

- Parent accounts can manage only their own children, geofences, ride requests, trips, and linked devices.
- Parent, child, and rider onboarding fields include consent timestamps and document URL metadata. Binary document storage should remain in protected object storage rather than the database.
- Riders see the minimum child data necessary for an active assignment; sensitive parent and child fields remain restricted.
- Rider trip start and completion enforce pickup and drop-off watch verification.
- Wallet settlement is atomic when a trip is completed; insufficient parent balance stops the settlement.

## Admin dashboard

The dashboard is composed from small PHP files in `app/Views/admin/components/` and `app/Views/admin/partials/`; its styles, images, and browser behavior are under `public/assets/admin/`. `public/assets/css/passage-theme.css` is the single source of PASSAGE colours and semantic status tokens for every rendered view. Admin sign-in calls `/api/v1/auth/login`; create an administrator through the API or database with a securely hashed password before using it.

## Documentation

- `docs/API_SPECIFICATION.md` — REST API reference.
- `docs/PROJECT_STATUS_AND_HANDOFF.md` — implementation status and production checklist.
- `docs/requirements/` — supplied product, onboarding, prototype, and watch requirements.
