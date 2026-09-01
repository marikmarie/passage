<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use App\Core\ApiException;
use PDO;

final class TripModel extends BaseModel
{
    protected array $fillable = ['rider_id', 'device_id', 'ride_request_id', 'start_time', 'end_time', 'distance_km', 'fare_amount', 'status'];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array { return $this->one('SELECT * FROM trips WHERE id = ?', [$id]); }

    /** @return array<string, mixed>|null */
    public function access(int $id): ?array
    {
        return $this->one(
            'SELECT t.id AS trip_id, t.rider_id, r.user_id AS rider_user_id, t.device_id, k.parent_user_id, t.ride_request_id, t.status AS trip_status, rr.status AS ride_request_status, d.current_state AS device_state, t.fare_amount
             FROM trips t
             JOIN riders r ON r.id = t.rider_id
             JOIN devices d ON d.id = t.device_id
             LEFT JOIN kids k ON k.device_id = t.device_id
             LEFT JOIN ride_requests rr ON rr.id = t.ride_request_id
             WHERE t.id = ?',
            [$id]
        );
    }

    /** @return array<string, mixed>|null */
    public function activeForUser(int $userId, string $role): ?array
    {
        $scope = match ($role) {
            'parent' => 'AND k.parent_user_id = ?',
            'rider' => 'AND r.user_id = ?',
            'admin', 'support' => '',
            default => null,
        };
        if ($scope === null) { return null; }
        $params = $scope === '' ? [] : [$userId];
        return $this->one(
            "SELECT t.*, r.user_id AS rider_user_id, rider_user.name AS rider_name, rider_user.phone_number AS rider_phone_number,
                    r.vehicle_type AS rider_vehicle_type, r.number_plate AS rider_number_plate, k.id AS child_id,
                    k.name AS child_name, k.school AS child_school, k.grade AS child_grade, k.parent_user_id,
                    d.imei AS device_imei, d.battery_level, d.current_state, d.last_online_at,
                    tl.lat AS latest_lat, tl.lng AS latest_lng, tl.accuracy AS latest_accuracy, tl.speed AS latest_speed, tl.timestamp AS latest_timestamp,
                    rr.pickup_label, rr.pickup_lat, rr.pickup_lng, rr.destination_label, rr.destination_lat, rr.destination_lng
             FROM trips t
             JOIN riders r ON r.id = t.rider_id
             JOIN users rider_user ON rider_user.id = r.user_id
             JOIN devices d ON d.id = t.device_id
             LEFT JOIN kids k ON k.device_id = t.device_id
             LEFT JOIN ride_requests rr ON rr.id = t.ride_request_id
             LEFT JOIN tracking_logs tl ON tl.id = (SELECT id FROM tracking_logs WHERE device_id = t.device_id ORDER BY timestamp DESC LIMIT 1)
             WHERE t.status IN ('awaiting_pickup', 'active') {$scope}
             ORDER BY COALESCE(t.start_time, t.created_at) DESC LIMIT 1",
            $params
        );
    }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function forRider(int $riderId, int $limit, int $offset): array
    {
        return [
            'items' => $this->all('SELECT * FROM trips WHERE rider_id = ? ORDER BY COALESCE(start_time, created_at) DESC LIMIT ? OFFSET ?', [$riderId, $limit, $offset]),
            'total' => $this->count('SELECT COUNT(*) AS total FROM trips WHERE rider_id = ?', [$riderId]),
        ];
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createTrip(array $data): array
    {
        $id = $this->insert('trips', ['status' => 'awaiting_pickup', 'distance_km' => 0, ...$data]);
        return $this->find($id) ?? throw new \RuntimeException('Trip creation failed.');
    }

    public function riderUserId(int $riderId): ?int
    {
        $rider = $this->one('SELECT user_id FROM riders WHERE id = ?', [$riderId]);
        return $rider === null ? null : (int) $rider['user_id'];
    }

    public function setDeviceState(int $deviceId, string $state): void
    {
        $this->execute('UPDATE devices SET current_state = ?, last_online_at = NOW() WHERE id = ?', [$state, $deviceId]);
    }

    public function start(int $tripId, int $riderUserId): array
    {
        $access = $this->access($tripId);
        if ($access === null || (int) $access['rider_user_id'] !== $riderUserId) {
            throw new ApiException('Trip does not belong to the authenticated rider.', 404, 'NOT_FOUND');
        }
        if ($access['trip_status'] !== 'awaiting_pickup' || $access['ride_request_status'] !== 'accepted') {
            throw new ApiException('Only an accepted trip awaiting pickup can be started.', 409, 'INVALID_TRIP_STATE');
        }
        if ($access['device_state'] !== 'PICKUP_CONFIRMED') {
            throw new ApiException('Pickup watch verification is required before starting the trip.', 409, 'VERIFICATION_REQUIRED');
        }

        $db = Database::connection();
        $db->beginTransaction();
        try {
            $this->execute("UPDATE trips SET status = 'active', start_time = NOW(), updated_at = NOW() WHERE id = ? AND status = 'awaiting_pickup'", [$tripId]);
            if ($access['ride_request_id'] !== null) {
                $this->execute("UPDATE ride_requests SET status = 'in_transit', updated_at = NOW() WHERE id = ? AND status = 'accepted'", [(int) $access['ride_request_id']]);
            }
            $this->setDeviceState((int) $access['device_id'], 'IN_TRANSIT');
            $db->commit();
        } catch (\Throwable $exception) {
            $db->rollBack();
            throw $exception;
        }
        return $this->find($tripId) ?? throw new \RuntimeException('Trip not found.');
    }

    public function complete(int $tripId, float $distanceKm, bool $requiresVerification): array
    {
        $access = $this->access($tripId);
        if ($access === null) { throw new ApiException('Trip not found.', 404, 'NOT_FOUND'); }
        if ($access['trip_status'] !== 'active') { throw new ApiException('Only an active trip can be completed.', 409, 'INVALID_TRIP_STATE'); }
        if ($requiresVerification && $access['device_state'] !== 'DROPOFF_CONFIRMED') {
            throw new ApiException('Drop-off watch verification is required before completing the trip.', 409, 'VERIFICATION_REQUIRED');
        }

        $db = Database::connection();
        $db->beginTransaction();
        try {
            $this->execute("UPDATE trips SET end_time = NOW(), distance_km = ?, status = 'completed', updated_at = NOW() WHERE id = ? AND status = 'active'", [$distanceKm, $tripId]);
            if ($access['ride_request_id'] !== null) {
                $this->execute("UPDATE ride_requests SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ?", [(int) $access['ride_request_id']]);
            }
            $this->setDeviceState((int) $access['device_id'], 'IDLE_READY');
            if ((float) $access['fare_amount'] > 0 && $access['parent_user_id'] !== null) {
                (new WalletModel())->settleFare($db, (int) $access['parent_user_id'], (int) $access['rider_user_id'], $tripId, (float) $access['fare_amount']);
            }
            $db->commit();
        } catch (\Throwable $exception) {
            $db->rollBack();
            throw $exception;
        }
        return $this->find($tripId) ?? throw new \RuntimeException('Trip not found.');
    }

    public function cancel(int $tripId): array
    {
        $access = $this->access($tripId);
        if ($access === null) { throw new ApiException('Trip not found.', 404, 'NOT_FOUND'); }
        if (in_array($access['trip_status'], ['completed', 'cancelled'], true)) { throw new ApiException('This trip is already closed.', 409, 'INVALID_TRIP_STATE'); }
        $db = Database::connection();
        $db->beginTransaction();
        try {
            $this->execute("UPDATE trips SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [$tripId]);
            if ($access['ride_request_id'] !== null) {
                $this->execute("UPDATE ride_requests SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?", [(int) $access['ride_request_id']]);
            }
            $this->setDeviceState((int) $access['device_id'], 'IDLE_READY');
            $db->commit();
        } catch (\Throwable $exception) {
            $db->rollBack();
            throw $exception;
        }
        return $this->find($tripId) ?? throw new \RuntimeException('Trip not found.');
    }
}
