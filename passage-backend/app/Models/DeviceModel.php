<?php

declare(strict_types=1);

namespace App\Models;

final class DeviceModel extends BaseModel
{
    protected array $fillable = ['imei', 'sim_number', 'firmware_version', 'battery_level', 'device_token', 'status', 'current_state', 'last_online_at'];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array { return $this->one('SELECT * FROM devices WHERE id = ?', [$id]); }
    /** @return array<string, mixed>|null */
    public function findByToken(string $token): ?array { return $this->one('SELECT id, imei, status, current_state, battery_level FROM devices WHERE device_token = ?', [$token]); }
    /** @return array<string, mixed>|null */
    public function findByImei(string $imei): ?array { return $this->one('SELECT * FROM devices WHERE imei = ?', [$imei]); }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function paginate(int $limit, int $offset): array
    {
        return [
            'items' => $this->all('SELECT * FROM devices ORDER BY id DESC LIMIT ? OFFSET ?', [$limit, $offset]),
            'total' => $this->count('SELECT COUNT(*) AS total FROM devices'),
        ];
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createDevice(array $data): array { $id = $this->insert('devices', $data); return $this->find($id) ?? throw new \RuntimeException('Device creation failed.'); }
    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateDevice(int $id, array $data): ?array { $this->update('devices', $id, $data); return $this->find($id); }
    public function deleteDevice(int $id): bool { return $this->execute('DELETE FROM devices WHERE id = ?', [$id]) > 0; }

    /** @return array<string, mixed> */
    public function watchState(int $deviceId): array
    {
        $trip = $this->one("SELECT t.id AS trip_id, d.current_state FROM devices d LEFT JOIN trips t ON t.device_id = d.id AND t.status IN ('awaiting_pickup', 'active') WHERE d.id = ? ORDER BY t.created_at DESC LIMIT 1", [$deviceId]);
        if ($trip === null || $trip['trip_id'] === null) {
            return ['state' => 'IDLE_READY', 'tripId' => null, 'message' => 'Ready', 'trackingIntervalSeconds' => 180];
        }
        $state = (string) $trip['current_state'];
        $interval = match ($state) {
            'RIDE_ASSIGNED', 'DRIVER_NEARBY' => 45,
            'IN_TRANSIT' => 15,
            'SOS_ACTIVE' => 5,
            default => 30,
        };
        $message = match ($state) {
            'RIDE_ASSIGNED', 'DRIVER_NEARBY' => 'Please get ready',
            'IN_TRANSIT' => 'In transit',
            'SOS_ACTIVE' => 'SOS triggered',
            default => 'Ready',
        };
        return ['state' => $state, 'tripId' => (int) $trip['trip_id'], 'message' => $message, 'trackingIntervalSeconds' => $interval];
    }
}
