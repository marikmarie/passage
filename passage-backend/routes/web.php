<?php

declare(strict_types=1);

use App\Controllers\AdminController;
use App\Controllers\AlertsController;
use App\Controllers\AuthController;
use App\Controllers\DevicesController;
use App\Controllers\GeofencesController;
use App\Controllers\KidsController;
use App\Controllers\NotificationsController;
use App\Controllers\PaymentsController;
use App\Controllers\ReportsController;
use App\Controllers\RideRequestsController;
use App\Controllers\RidersController;
use App\Controllers\RoutePlanningController;
use App\Controllers\SubscriptionsController;
use App\Controllers\TrackingController;
use App\Controllers\TripsController;
use App\Controllers\UsersController;
use App\Controllers\WalletController;
use App\Controllers\WebController;
use App\Core\Auth;
use App\Core\Router;

$router = new Router();
$web = new WebController();
$auth = new AuthController();
$users = new UsersController();
$riders = new RidersController();
$kids = new KidsController();
$devices = new DevicesController();
$tracking = new TrackingController();
$trips = new TripsController();
$geofences = new GeofencesController();
$alerts = new AlertsController();
$notifications = new NotificationsController();
$payments = new PaymentsController();
$wallet = new WalletController();
$subscriptions = new SubscriptionsController();
$reports = new ReportsController();
$routes = new RoutePlanningController();
$rideRequests = new RideRequestsController();
$admin = new AdminController();

$router->add('GET', '/', [$web, 'home'])
    ->add('GET', '/admin', [$web, 'admin'])
    ->add('GET', '/admin/dashboard', [$web, 'adminDashboard'])
    ->add('GET', '/admin/view/{page}', [$web, 'adminPartial'])
    ->add('GET', '/health', [$web, 'health']);

/** @param array<int, callable(\App\Core\Request): void> $middleware */
$api = static function (string $method, string $path, callable $handler, array $middleware = []) use ($router): void {
    $router->add($method, '/api' . $path, $handler, $middleware);
    $router->add($method, '/api/v1' . $path, $handler, $middleware);
};

$api('GET', '/health', [$web, 'health']);

$api('POST', '/auth/register', [$auth, 'register']);
$api('POST', '/auth/login', [$auth, 'login']);
$api('POST', '/auth/otp/request', [$auth, 'requestOtp']);
$api('POST', '/auth/otp/verify', [$auth, 'verifyOtp']);
$api('GET', '/auth/me', [$auth, 'me'], [Auth::bearer()]);
$api('POST', '/auth/logout', [$auth, 'logout'], [Auth::bearer()]);

$api('GET', '/users', [$users, 'index'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/users/{id}', [$users, 'show'], [Auth::bearer()]);
$api('PUT', '/users/{id}', [$users, 'update'], [Auth::bearer()]);
$api('DELETE', '/users/{id}', [$users, 'delete'], [Auth::bearer(), Auth::roles(['admin'])]);

$api('GET', '/riders/me', [$riders, 'me'], [Auth::bearer()]);
$api('POST', '/riders/me', [$riders, 'upsertMe'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('PUT', '/riders/me', [$riders, 'upsertMe'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('GET', '/riders/by-parent', [$riders, 'byParent'], [Auth::bearer(), Auth::roles(['parent', 'admin', 'support'])]);
$api('GET', '/riders/{id}', [$riders, 'show'], [Auth::bearer()]);
$api('POST', '/riders', [$riders, 'create'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('PUT', '/riders/{id}', [$riders, 'update'], [Auth::bearer()]);
$api('DELETE', '/riders/{id}', [$riders, 'delete'], [Auth::bearer(), Auth::roles(['admin'])]);

$api('GET', '/kids', [$kids, 'index'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/kids/by-parent', [$kids, 'byParent'], [Auth::bearer(), Auth::roles(['parent', 'admin', 'support'])]);
$api('GET', '/kids/device/{deviceId}', [$kids, 'byDevice'], [Auth::bearer()]);
$api('GET', '/kids/{id}', [$kids, 'show'], [Auth::bearer()]);
$api('POST', '/kids', [$kids, 'create'], [Auth::bearer(), Auth::roles(['parent', 'admin', 'support'])]);
$api('PUT', '/kids/{id}', [$kids, 'update'], [Auth::bearer(), Auth::roles(['parent', 'admin', 'support'])]);
$api('DELETE', '/kids/{id}', [$kids, 'delete'], [Auth::bearer(), Auth::roles(['parent', 'admin'])]);

$api('GET', '/devices/state/{deviceId}', [$devices, 'state'], [Auth::device()]);
$api('POST', '/devices/location', [$devices, 'location'], [Auth::device()]);
$api('POST', '/devices/event', [$devices, 'event'], [Auth::device()]);
$api('POST', '/devices/verification-token', [$devices, 'verificationToken'], [Auth::device()]);
$api('POST', '/devices/verify-watch', [$trips, 'verifyWatch'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('GET', '/devices', [$devices, 'index'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/devices/{id}', [$devices, 'show'], [Auth::bearer()]);
$api('POST', '/devices', [$devices, 'create'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('PUT', '/devices/{id}', [$devices, 'update'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('DELETE', '/devices/{id}', [$devices, 'delete'], [Auth::bearer(), Auth::roles(['admin'])]);

$api('GET', '/watch/state/{deviceId}', [$devices, 'state'], [Auth::device()]);
$api('POST', '/watch/verification-token', [$devices, 'verificationToken'], [Auth::device()]);

$api('GET', '/tracking/latest/{deviceId}', [$tracking, 'latest'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('GET', '/tracking/history/{deviceId}', [$tracking, 'history'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('GET', '/tracking/playback/{deviceId}', [$tracking, 'playback'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('POST', '/tracking/log', [$tracking, 'log'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);

$api('POST', '/trips/verify', [$trips, 'verifyWatch'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('POST', '/trips/verify-watch', [$trips, 'verifyWatch'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('GET', '/trips/active', [$trips, 'active'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('GET', '/trips/rider/{riderId}', [$trips, 'riderTrips'], [Auth::bearer(), Auth::roles(['rider', 'admin', 'support'])]);
$api('GET', '/trips/{id}', [$trips, 'show'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('POST', '/trips', [$trips, 'create'], [Auth::bearer(), Auth::roles(['rider', 'admin', 'support'])]);
$api('PUT', '/trips/{id}/start', [$trips, 'start'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('PUT', '/trips/{id}/end', [$trips, 'end'], [Auth::bearer(), Auth::roles(['rider', 'admin', 'support'])]);
$api('PUT', '/trips/{id}/cancel', [$trips, 'cancel'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);

$api('GET', '/geofences/{id}', [$geofences, 'show'], [Auth::bearer()]);
$api('GET', '/geofences', [$geofences, 'index'], [Auth::bearer()]);
$api('POST', '/geofences', [$geofences, 'create'], [Auth::bearer()]);
$api('PUT', '/geofences/{id}', [$geofences, 'update'], [Auth::bearer()]);
$api('DELETE', '/geofences/{id}', [$geofences, 'delete'], [Auth::bearer()]);

$api('GET', '/alerts/device/{deviceId}', [$alerts, 'byDevice'], [Auth::bearer()]);
$api('GET', '/alerts', [$alerts, 'index'], [Auth::bearer()]);
$api('POST', '/alerts', [$alerts, 'create'], [Auth::bearer()]);
$api('PUT', '/alerts/{id}/resolve', [$alerts, 'resolve'], [Auth::bearer()]);

$api('GET', '/notifications', [$notifications, 'index'], [Auth::bearer()]);
$api('PUT', '/notifications/read-all', [$notifications, 'readAll'], [Auth::bearer()]);
$api('PUT', '/notifications/{id}/read', [$notifications, 'read'], [Auth::bearer()]);
$api('POST', '/notifications', [$notifications, 'create'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);

$api('GET', '/payments', [$payments, 'index'], [Auth::bearer()]);
$api('POST', '/payments', [$payments, 'initiate'], [Auth::bearer()]);
$api('GET', '/payments/{paymentId}/status', [$payments, 'verify'], [Auth::bearer()]);
$api('GET', '/wallet', [$wallet, 'summary'], [Auth::bearer()]);
$api('POST', '/wallet/payouts', [$wallet, 'payout'], [Auth::bearer(), Auth::roles(['rider'])]);

$api('GET', '/subscriptions/all', [$subscriptions, 'index'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/subscriptions', [$subscriptions, 'mine'], [Auth::bearer()]);
$api('POST', '/subscriptions', [$subscriptions, 'create'], [Auth::bearer()]);
$api('PUT', '/subscriptions/{id}/upgrade', [$subscriptions, 'upgrade'], [Auth::bearer()]);
$api('PUT', '/subscriptions/{id}/renew', [$subscriptions, 'renew'], [Auth::bearer()]);

$api('GET', '/reports/daily-trips', [$reports, 'dailyTrips'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/reports/sos-frequency', [$reports, 'sos'], [Auth::bearer(), Auth::roles(['admin', 'support'])]);
$api('GET', '/reports/revenue', [$reports, 'revenue'], [Auth::bearer(), Auth::roles(['admin'])]);
$api('GET', '/reports/analytics', [$reports, 'analytics'], [Auth::bearer(), Auth::roles(['admin'])]);

$api('GET', '/routes/directions', [$routes, 'directions'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('POST', '/routes/directions', [$routes, 'directions'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);
$api('POST', '/routes/nearest-rider', [$routes, 'nearestRider'], [Auth::bearer(), Auth::roles(['parent', 'admin', 'support'])]);

$api('GET', '/ride-requests/active', [$rideRequests, 'active'], [Auth::bearer(), Auth::roles(['parent', 'rider'])]);
$api('GET', '/ride-requests', [$rideRequests, 'index'], [Auth::bearer(), Auth::roles(['parent', 'rider'])]);
$api('POST', '/ride-requests', [$rideRequests, 'create'], [Auth::bearer(), Auth::roles(['parent'])]);
$api('PUT', '/ride-requests/rider/availability', [$rideRequests, 'availability'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('POST', '/ride-requests/{id}/accept', [$rideRequests, 'accept'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('POST', '/ride-requests/{id}/decline', [$rideRequests, 'decline'], [Auth::bearer(), Auth::roles(['rider'])]);
$api('POST', '/ride-requests/{id}/cancel', [$rideRequests, 'cancel'], [Auth::bearer(), Auth::roles(['parent'])]);
$api('GET', '/ride-requests/{id}', [$rideRequests, 'show'], [Auth::bearer(), Auth::roles(['parent', 'rider', 'admin', 'support'])]);

$adminMiddleware = [Auth::bearer(), Auth::roles(['admin'])];
$api('GET', '/admin/stats', [$admin, 'stats'], $adminMiddleware);
$api('GET', '/admin/users', [$admin, 'users'], $adminMiddleware);
$api('PUT', '/admin/users/{userId}/status', [$admin, 'userStatus'], $adminMiddleware);
$api('GET', '/admin/devices', [$admin, 'devices'], $adminMiddleware);
$api('GET', '/admin/alerts', [$admin, 'alerts'], $adminMiddleware);
$api('GET', '/admin/payments', [$admin, 'payments'], $adminMiddleware);
$api('GET', '/admin/rider-reviews', [$admin, 'riderReviews'], $adminMiddleware);
$api('GET', '/admin/rider-reviews/{riderId}', [$admin, 'riderReview'], $adminMiddleware);
$api('PUT', '/admin/rider-reviews/{riderId}/status', [$admin, 'riderReviewStatus'], $adminMiddleware);

return $router;
