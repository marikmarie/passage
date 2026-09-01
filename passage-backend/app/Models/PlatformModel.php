<?php

declare(strict_types=1);

namespace App\Models;

final class PlatformModel extends BaseModel
{
    /** @return array<string, mixed>|null */
    public function latestLocation(int $deviceId): ?array
    {
        return $this->one('SELECT * FROM tracking_logs WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1', [$deviceId]);
    }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function locationHistory(int $deviceId, int $limit, int $offset): array
    {
        return [
            'items' => $this->all('SELECT * FROM tracking_logs WHERE device_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [$deviceId, $limit, $offset]),
            'total' => $this->count('SELECT COUNT(*) AS total FROM tracking_logs WHERE device_id = ?', [$deviceId]),
        ];
    }

    /** @param array<string, mixed> $data */
    public function storeLocation(array $data): void
    {
        $this->execute('INSERT INTO tracking_logs (device_id, lat, lng, accuracy, speed, timestamp) VALUES (?, ?, ?, ?, ?, ?)', [
            $data['device_id'], $data['lat'], $data['lng'], $data['accuracy'] ?? null, $data['speed'] ?? 0, $data['timestamp'] ?? date('Y-m-d H:i:s'),
        ]);
        $this->execute('UPDATE devices SET battery_level = COALESCE(?, battery_level), last_online_at = NOW() WHERE id = ?', [$data['battery'] ?? null, $data['device_id']]);
    }

    /** @return array<int, array<string, mixed>> */
    public function geofences(int $parentUserId): array { return $this->all('SELECT * FROM geofences WHERE parent_user_id = ? ORDER BY id DESC', [$parentUserId]); }
    /** @return array<string, mixed>|null */
    public function geofence(int $id): ?array { return $this->one('SELECT * FROM geofences WHERE id = ?', [$id]); }
    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createGeofence(array $data): array
    {
        $this->execute('INSERT INTO geofences (parent_user_id, name, lat, lng, radius_meters) VALUES (?, ?, ?, ?, ?)', [$data['parent_user_id'], $data['name'], $data['lat'], $data['lng'], $data['radius_meters'] ?? 100]);
        return $this->geofence((int) $this->db()->lastInsertId()) ?? throw new \RuntimeException('Geofence creation failed.');
    }
    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateGeofence(int $id, array $data): ?array
    {
        $safe = array_intersect_key($data, array_flip(['name', 'lat', 'lng', 'radius_meters']));
        if ($safe !== []) { $this->updateRaw('geofences', $id, $safe); }
        return $this->geofence($id);
    }
    public function deleteGeofence(int $id): bool { return $this->execute('DELETE FROM geofences WHERE id = ?', [$id]) > 0; }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function alerts(int $limit, int $offset, ?int $deviceId = null): array
    {
        $where = $deviceId === null ? '' : ' WHERE a.device_id = ?';
        $base = ' FROM alerts a LEFT JOIN devices d ON d.id = a.device_id LEFT JOIN riders r ON r.id = a.rider_id';
        $params = $deviceId === null ? [$limit, $offset] : [$deviceId, $limit, $offset];
        return [
            'items' => $this->all('SELECT a.*, d.imei, r.full_name AS rider_name' . $base . $where . ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?', $params),
            'total' => $this->count('SELECT COUNT(*) AS total' . $base . $where, $deviceId === null ? [] : [$deviceId]),
        ];
    }
    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createAlert(array $data): array
    {
        $this->execute('INSERT INTO alerts (device_id, rider_id, type, message, status) VALUES (?, ?, ?, ?, ?)', [$data['device_id'], $data['rider_id'] ?? null, $data['type'], $data['message'] ?? null, $data['status'] ?? 'open']);
        return $this->one('SELECT * FROM alerts WHERE id = ?', [(int) $this->db()->lastInsertId()]) ?? throw new \RuntimeException('Alert creation failed.');
    }
    /** @return array<string, mixed>|null */
    public function resolveAlert(int $id): ?array { $this->execute("UPDATE alerts SET status = 'resolved', updated_at = NOW() WHERE id = ?", [$id]); return $this->one('SELECT * FROM alerts WHERE id = ?', [$id]); }

    /** @return array<int, array<string, mixed>> */
    public function notifications(int $userId): array { return $this->all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [$userId]); }
    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createNotification(array $data): array
    {
        $this->execute('INSERT INTO notifications (user_id, title, body, type, channel) VALUES (?, ?, ?, ?, ?)', [$data['user_id'], $data['title'], $data['body'] ?? null, $data['type'] ?? 'general', $data['channel'] ?? 'in_app']);
        return $this->one('SELECT * FROM notifications WHERE id = ?', [(int) $this->db()->lastInsertId()]) ?? throw new \RuntimeException('Notification creation failed.');
    }
    public function markNotification(int $id, int $userId): bool { return $this->execute('UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?', [$id, $userId]) > 0; }
    public function markAllNotifications(int $userId): int { return $this->execute('UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL', [$userId]); }

    /** @return array<string, mixed>|null */
    public function subscription(int $userId): ?array { return $this->one('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [$userId]); }
    /** @return array<string, mixed>|null */
    public function subscriptionById(int $id): ?array { return $this->one('SELECT * FROM subscriptions WHERE id = ?', [$id]); }
    /** @return array<int, array<string, mixed>> */
    public function subscriptions(): array { return $this->all('SELECT s.*, u.name, u.email FROM subscriptions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC'); }
    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createSubscription(array $data): array
    {
        $this->execute('INSERT INTO subscriptions (user_id, plan, end_date, payment_id) VALUES (?, ?, ?, ?)', [$data['user_id'], $data['plan'] ?? 'free', $data['end_date'] ?? null, $data['payment_id'] ?? null]);
        return $this->one('SELECT * FROM subscriptions WHERE id = ?', [(int) $this->db()->lastInsertId()]) ?? throw new \RuntimeException('Subscription creation failed.');
    }
    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateSubscription(int $id, array $data): ?array
    {
        $safe = array_intersect_key($data, array_flip(['plan', 'end_date', 'payment_id']));
        if ($safe !== []) { $this->updateRaw('subscriptions', $id, $safe); }
        return $this->one('SELECT * FROM subscriptions WHERE id = ?', [$id]);
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createPayment(array $data): array
    {
        $reference = $data['reference'] ?? ('pay-' . bin2hex(random_bytes(12)));
        $this->execute('INSERT INTO payments (user_id, amount, currency, provider, reference, provider_ref, phone, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            $data['user_id'], $data['amount'], $data['currency'] ?? 'UGX', $data['provider'] ?? 'collecto', $reference, $data['provider_ref'] ?? null,
            $data['phone'] ?? null, $data['description'] ?? 'PASSAGE wallet top-up', $data['status'] ?? 'pending',
        ]);
        return $this->one('SELECT * FROM payments WHERE id = ?', [(int) $this->db()->lastInsertId()]) ?? throw new \RuntimeException('Payment creation failed.');
    }
    /** @return array<int, array<string, mixed>> */
    public function payments(int $userId, string $role): array
    {
        return in_array($role, ['admin', 'support'], true)
            ? $this->all('SELECT p.*, u.name, u.email FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC')
            : $this->all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [$userId]);
    }
    /** @return array<string, mixed>|null */
    public function payment(int $id): ?array { return $this->one('SELECT * FROM payments WHERE id = ?', [$id]); }
    /** @return array<string, mixed>|null */
    public function completePayment(int $id): ?array { $this->execute("UPDATE payments SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'pending'", [$id]); return $this->payment($id); }

    /** @return array<string, int|float> */
    public function systemStats(): array
    {
        return [
            'users' => $this->count('SELECT COUNT(*) AS total FROM users'),
            'riders' => $this->count('SELECT COUNT(*) AS total FROM riders'),
            'kids' => $this->count('SELECT COUNT(*) AS total FROM kids'),
            'active_devices' => $this->count("SELECT COUNT(*) AS total FROM devices WHERE status = 'active'"),
            'active_trips' => $this->count("SELECT COUNT(*) AS total FROM trips WHERE status = 'active'"),
            'open_alerts' => $this->count("SELECT COUNT(*) AS total FROM alerts WHERE status <> 'resolved'"),
            'revenue' => (float) (($this->one("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'")['total'] ?? 0)),
        ];
    }

    /** @param array<string, mixed> $data */
    private function updateRaw(string $table, int $id, array $data): void
    {
        $assignments = implode(', ', array_map(static fn (string $field): string => "{$field} = ?", array_keys($data)));
        $this->execute("UPDATE {$table} SET {$assignments}, updated_at = NOW() WHERE id = ?", [...array_values($data), $id]);
    }
}
