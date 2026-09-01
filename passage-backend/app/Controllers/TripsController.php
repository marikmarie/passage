<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Config;
use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\KidModel;
use App\Models\PlatformModel;
use App\Models\TripModel;

final class TripsController extends Controller
{
    private TripModel $trips;
    private PlatformModel $platform;
    public function __construct() { $this->trips = new TripModel(); $this->platform = new PlatformModel(); }

    public function verifyWatch(Request $request): never
    {
        $user = $this->user($request); $this->requireFields($request, ['tripId', 'verificationToken']);
        $tripId = (int) $request->input('tripId'); $action = strtoupper((string) $request->input('action', 'PICKUP'));
        if (!in_array($action, ['PICKUP', 'DROPOFF'], true)) { throw new ApiException('action must be PICKUP or DROPOFF.', 422, 'VALIDATION_ERROR'); }
        $access = $this->trips->access($tripId);
        if ($access === null || (int) $access['rider_user_id'] !== (int) $user['id']) { throw new ApiException('Trip does not belong to the authenticated rider.', 403, 'FORBIDDEN'); }
        $validState = $action === 'PICKUP'
            ? $access['trip_status'] === 'awaiting_pickup' && $access['ride_request_status'] === 'accepted'
            : $access['trip_status'] === 'active' && $access['ride_request_status'] === 'in_transit';
        if (!$validState) { throw new ApiException("{$action} is not allowed for the current trip state.", 409, 'INVALID_TRIP_STATE'); }
        $token = (string) $request->input('verificationToken');
        $parts = explode('.', $token);
        $secret = (string) Config::get('TOKEN_SECRET', '');
        if (count($parts) !== 2 || $secret === '' || !hash_equals(hash_hmac('sha256', $parts[0], $secret), $parts[1])) { throw new ApiException('Invalid verification token.', 422, 'INVALID_VERIFICATION_TOKEN'); }
        $tokenParts = explode(':', $parts[0]);
        if (count($tokenParts) < 3 || (int) $tokenParts[0] !== (int) $access['device_id'] || (int) $tokenParts[1] !== $tripId || ((int) floor(microtime(true) * 1000) - (int) $tokenParts[2]) > 120000) { throw new ApiException('Verification token is invalid or expired.', 422, 'INVALID_VERIFICATION_TOKEN'); }
        $statement = Database::connection()->prepare(Database::prefixTables('UPDATE watch_verification_tokens SET used_at = NOW() WHERE token_hash = ? AND trip_id = ? AND device_id = ? AND used_at IS NULL AND expires_at > NOW()'));
        $statement->execute([hash('sha256', $token), $tripId, (int) $access['device_id']]);
        if ($statement->rowCount() !== 1) { throw new ApiException('Verification token is invalid, expired, or already used.', 422, 'INVALID_VERIFICATION_TOKEN'); }
        $state = $action === 'PICKUP' ? 'PICKUP_CONFIRMED' : 'DROPOFF_CONFIRMED';
        $this->trips->setDeviceState((int) $access['device_id'], $state);
        Response::success('Watch verification successful.', ['tripId' => $tripId, 'action' => $action, 'state' => $state]);
    }

    public function active(Request $request): never
    {
        $user = $this->user($request); $trip = $this->trips->activeForUser((int) $user['id'], (string) $user['role']);
        if ($trip === null) { Response::success('No active trip found', null); }
        $trip = $this->activeResponse($trip, (string) $user['role']);
        Response::success('Active trip retrieved successfully', $trip);
    }

    public function show(Request $request): never
    {
        $user = $this->user($request); $trip = $this->trips->find($this->id($request));
        if ($trip === null) { throw new ApiException('Trip not found.', 404, 'NOT_FOUND'); }
        $this->assertTripAccess($user, (int) $trip['id']);
        Response::success('Trip retrieved successfully', $trip);
    }

    public function riderTrips(Request $request): never
    {
        $user = $this->user($request); $riderId = $this->id($request, 'riderId');
        if (!in_array($user['role'], ['admin', 'support'], true) && ($user['role'] !== 'rider' || $this->trips->riderUserId($riderId) !== (int) $user['id'])) { throw new ApiException('You do not have permission to access this rider\'s trips.', 403, 'FORBIDDEN'); }
        $page = $this->page($request); $result = $this->trips->forRider($riderId, $page['limit'], $page['offset']);
        Response::paginated('Trips retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function create(Request $request): never
    {
        $this->requireFields($request, ['rider_id', 'device_id']);
        $user = $this->user($request); $riderId = (int) $request->input('rider_id');
        if ($user['role'] === 'rider' && $this->trips->riderUserId($riderId) !== (int) $user['id']) { throw new ApiException('You do not have permission to create this trip.', 403, 'FORBIDDEN'); }
        $trip = $this->trips->createTrip(['rider_id' => $riderId, 'device_id' => (int) $request->input('device_id'), 'fare_amount' => (float) $request->input('fare_amount', 0)]);
        Response::success('Trip created successfully', $trip, 201);
    }

    public function start(Request $request): never
    {
        $trip = $this->trips->start($this->id($request), (int) $this->user($request)['id']);
        $access = $this->trips->access((int) $trip['id']);
        if ($access !== null && $access['parent_user_id'] !== null) { $this->platform->createNotification(['user_id' => (int) $access['parent_user_id'], 'title' => 'Trip started', 'body' => 'Pickup was verified and the journey is now in progress.', 'type' => 'trip']); }
        Response::success('Trip started successfully', $trip);
    }

    public function end(Request $request): never
    {
        $this->requireFields($request, ['distance_km']);
        $id = $this->id($request); $user = $this->user($request); $this->assertTripAccess($user, $id);
        $distance = (float) $request->input('distance_km'); if ($distance < 0) { throw new ApiException('distance_km must be a non-negative number.', 422, 'VALIDATION_ERROR'); }
        $trip = $this->trips->complete($id, $distance, $user['role'] === 'rider');
        $access = $this->trips->access($id);
        if ($access !== null) {
            foreach ([(int) $access['parent_user_id'], (int) $access['rider_user_id']] as $userId) { if ($userId > 0) { $this->platform->createNotification(['user_id' => $userId, 'title' => 'Trip completed', 'body' => 'Drop-off was verified and the journey was completed safely.', 'type' => 'trip']); } }
        }
        Response::success('Trip ended successfully', $trip);
    }

    public function cancel(Request $request): never
    {
        $id = $this->id($request); $this->assertTripAccess($this->user($request), $id);
        Response::success('Trip cancelled successfully', $this->trips->cancel($id));
    }

    /** @param array<string, mixed> $user */
    private function assertTripAccess(array $user, int $tripId): void
    {
        if (in_array($user['role'], ['admin', 'support'], true)) { return; }
        $access = $this->trips->access($tripId);
        $allowed = $access !== null && (($user['role'] === 'parent' && (int) $access['parent_user_id'] === (int) $user['id']) || ($user['role'] === 'rider' && (int) $access['rider_user_id'] === (int) $user['id']));
        if (!$allowed) { throw new ApiException('You do not have permission to access this trip.', 403, 'FORBIDDEN'); }
    }

    /** @param array<string, mixed> $trip @return array<string, mixed> */
    private function activeResponse(array $trip, string $role): array
    {
        $canSeeName = in_array($role, ['parent', 'admin', 'support'], true);
        $child = ['id' => $trip['child_id'] === null ? null : (int) $trip['child_id'], 'display_name' => $canSeeName ? ($trip['child_name'] ?? 'Assigned passenger') : ('Passenger #' . ($trip['child_id'] ?? '')),
                  'school' => $trip['child_school'], 'grade' => $trip['child_grade']];
        if ($canSeeName && $trip['child_name'] !== null) { $child['name'] = $trip['child_name']; }
        $points = [];
        if ($trip['pickup_lat'] !== null && $trip['pickup_lng'] !== null) { $points[] = ['lat' => (float) $trip['pickup_lat'], 'lng' => (float) $trip['pickup_lng']]; }
        if ($trip['destination_lat'] !== null && $trip['destination_lng'] !== null) { $points[] = ['lat' => (float) $trip['destination_lat'], 'lng' => (float) $trip['destination_lng']]; }
        return ['trip' => ['id' => (int) $trip['id'], 'status' => $trip['status'], 'start_time' => $trip['start_time'], 'end_time' => $trip['end_time'], 'distance_km' => (float) $trip['distance_km']],
                'child' => $child,
                'rider' => ['id' => (int) $trip['rider_id'], 'user_id' => (int) $trip['rider_user_id'], 'name' => $trip['rider_name'], 'phone_number' => $trip['rider_phone_number'], 'vehicle_type' => $trip['rider_vehicle_type'], 'number_plate' => $trip['rider_number_plate']],
                'device' => ['id' => (int) $trip['device_id'], 'battery_level' => $trip['battery_level'], 'current_state' => $trip['current_state'], 'last_online_at' => $trip['last_online_at']],
                'latest_location' => $trip['latest_lat'] === null ? null : ['lat' => (float) $trip['latest_lat'], 'lng' => (float) $trip['latest_lng'], 'accuracy' => $trip['latest_accuracy'] === null ? null : (float) $trip['latest_accuracy'], 'speed' => $trip['latest_speed'] === null ? null : (float) $trip['latest_speed'], 'timestamp' => $trip['latest_timestamp']],
                'route' => ['pickup_label' => $trip['pickup_label'], 'destination_label' => $trip['destination_label'], 'points' => $points, 'distance_meters' => null, 'duration_seconds' => null]];
    }
}
