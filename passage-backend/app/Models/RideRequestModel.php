<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\ApiException;
use App\Core\Database;

final class RideRequestModel extends BaseModel
{
    protected array $fillable = [
        'parent_user_id', 'kid_id', 'device_id', 'assigned_rider_id', 'requested_vehicle_type', 'fare_amount', 'journey_type',
        'pickup_label', 'pickup_lat', 'pickup_lng', 'destination_label', 'destination_lat', 'destination_lng', 'status',
        'assigned_at', 'accepted_at', 'declined_at', 'cancelled_at', 'completed_at',
    ];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        return $this->one('SELECT rr.*, k.name AS child_name, k.school, r.full_name AS rider_name, r.vehicle_type, r.number_plate
                           FROM ride_requests rr
                           JOIN kids k ON k.id = rr.kid_id
                           LEFT JOIN riders r ON r.id = rr.assigned_rider_id
                           WHERE rr.id = ?', [$id]);
    }

    /** @return array<string, mixed>|null */
    public function activeForUser(int $userId, string $role): ?array
    {
        $where = $role === 'parent' ? 'rr.parent_user_id = ?' : 'r.user_id = ?';
        $join = $role === 'rider' ? 'JOIN riders r ON r.id = rr.assigned_rider_id' : '';
        return $this->one("SELECT rr.*, k.name AS child_name FROM ride_requests rr JOIN kids k ON k.id = rr.kid_id {$join} WHERE {$where} AND rr.status IN ('pending_assignment', 'assigned', 'accepted', 'in_transit') ORDER BY rr.created_at DESC LIMIT 1", [$userId]);
    }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function paginateForUser(int $userId, string $role, int $limit, int $offset): array
    {
        if ($role === 'parent') {
            $base = ' FROM ride_requests rr JOIN kids k ON k.id = rr.kid_id LEFT JOIN riders r ON r.id = rr.assigned_rider_id WHERE rr.parent_user_id = ?';
        } else {
            $base = ' FROM ride_requests rr JOIN kids k ON k.id = rr.kid_id JOIN riders r ON r.id = rr.assigned_rider_id WHERE r.user_id = ?';
        }
        return [
            'items' => $this->all('SELECT rr.*, k.name AS child_name, r.full_name AS rider_name' . $base . ' ORDER BY rr.created_at DESC LIMIT ? OFFSET ?', [$userId, $limit, $offset]),
            'total' => $this->count('SELECT COUNT(*) AS total' . $base, [$userId]),
        ];
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createRequest(array $data): array
    {
        $id = $this->insert('ride_requests', ['status' => 'pending_assignment', ...$data]);
        return $this->find($id) ?? throw new \RuntimeException('Ride request creation failed.');
    }

    /** @return array<string, mixed>|null */
    public function approvedAvailableRider(string $vehicleType, float $lat, float $lng): ?array
    {
        return $this->one(
            "SELECT r.id, r.user_id,
                (6371 * ACOS(LEAST(1, COS(RADIANS(?)) * COS(RADIANS(ra.lat)) * COS(RADIANS(ra.lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(ra.lat))))) AS distance_km
             FROM riders r
             JOIN rider_availability ra ON ra.rider_id = r.id
             WHERE r.approval_status = 'approved' AND r.vehicle_type = ? AND ra.vehicle_type = ? AND ra.is_available = 1
             ORDER BY distance_km ASC LIMIT 1",
            [$lat, $lng, $lat, $vehicleType, $vehicleType]
        );
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function setAvailability(int $riderId, array $data): array
    {
        $this->execute(
            'INSERT INTO rider_availability (rider_id, vehicle_type, lat, lng, is_available, last_seen_at) VALUES (?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE vehicle_type = VALUES(vehicle_type), lat = VALUES(lat), lng = VALUES(lng), is_available = VALUES(is_available), last_seen_at = NOW()',
            [$riderId, $data['vehicle_type'], $data['lat'], $data['lng'], $data['is_available'] ? 1 : 0]
        );
        return $this->one('SELECT * FROM rider_availability WHERE rider_id = ?', [$riderId]) ?? throw new \RuntimeException('Availability update failed.');
    }

    /** @return array<string, mixed> */
    public function accept(int $requestId, int $riderUserId): array
    {
        $request = $this->find($requestId);
        if ($request === null || $request['assigned_rider_id'] === null) { throw new ApiException('Ride request not found.', 404, 'NOT_FOUND'); }
        $rider = $this->one('SELECT id FROM riders WHERE id = ? AND user_id = ?', [(int) $request['assigned_rider_id'], $riderUserId]);
        if ($rider === null) { throw new ApiException('Ride request is not assigned to this rider.', 403, 'FORBIDDEN'); }
        if ($request['status'] !== 'assigned') { throw new ApiException('Only an assigned request can be accepted.', 409, 'INVALID_REQUEST_STATE'); }

        $db = Database::connection();
        $db->beginTransaction();
        try {
            $this->execute("UPDATE ride_requests SET status = 'accepted', accepted_at = NOW(), updated_at = NOW() WHERE id = ?", [$requestId]);
            (new TripModel())->createTrip([
                'rider_id' => (int) $request['assigned_rider_id'], 'device_id' => (int) $request['device_id'], 'ride_request_id' => $requestId,
                'fare_amount' => $request['fare_amount'], 'status' => 'awaiting_pickup', 'distance_km' => 0,
            ]);
            $this->execute("UPDATE devices SET current_state = 'RIDE_ASSIGNED', last_online_at = NOW() WHERE id = ?", [(int) $request['device_id']]);
            $db->commit();
        } catch (\Throwable $exception) {
            $db->rollBack();
            throw $exception;
        }
        return $this->find($requestId) ?? throw new \RuntimeException('Ride request not found.');
    }

    /** @return array<string, mixed> */
    public function decline(int $requestId, int $riderUserId): array
    {
        $request = $this->find($requestId);
        if ($request === null || $request['assigned_rider_id'] === null) { throw new ApiException('Ride request not found.', 404, 'NOT_FOUND'); }
        $rider = $this->one('SELECT id FROM riders WHERE id = ? AND user_id = ?', [(int) $request['assigned_rider_id'], $riderUserId]);
        if ($rider === null) { throw new ApiException('Ride request is not assigned to this rider.', 403, 'FORBIDDEN'); }
        $this->execute("UPDATE ride_requests SET status = 'rider_declined', declined_at = NOW(), assigned_rider_id = NULL, updated_at = NOW() WHERE id = ?", [$requestId]);
        return $this->find($requestId) ?? throw new \RuntimeException('Ride request not found.');
    }

    /** @return array<string, mixed> */
    public function cancel(int $requestId, int $parentUserId): array
    {
        $request = $this->find($requestId);
        if ($request === null || (int) $request['parent_user_id'] !== $parentUserId) { throw new ApiException('Ride request not found.', 404, 'NOT_FOUND'); }
        if (in_array($request['status'], ['completed', 'cancelled', 'in_transit'], true)) { throw new ApiException('This ride request cannot be cancelled.', 409, 'INVALID_REQUEST_STATE'); }
        $this->execute("UPDATE ride_requests SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?", [$requestId]);
        return $this->find($requestId) ?? throw new \RuntimeException('Ride request not found.');
    }
}
