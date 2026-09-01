<?php

declare(strict_types=1);

namespace App\Models;

final class KidModel extends BaseModel
{
    protected array $fillable = [
        'parent_user_id', 'device_id', 'name', 'age', 'school', 'grade', 'date_of_birth', 'gender',
        'home_location', 'home_lat', 'home_lng', 'school_location', 'school_lat', 'school_lng',
        'morning_pickup_time', 'afternoon_return_time', 'pickup_notes', 'emergency_contact_name',
        'emergency_contact_relationship', 'emergency_contact_phone', 'guardian_name',
        'guardian_relationship', 'guardian_phone', 'allow_live_tracking', 'safety_consent_at', 'passport_photo_url',
        'school_document_url', 'school_document_unavailable',
    ];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array { return $this->one('SELECT * FROM kids WHERE id = ?', [$id]); }
    /** @return array<string, mixed>|null */
    public function findByDevice(int $deviceId): ?array { return $this->one('SELECT * FROM kids WHERE device_id = ?', [$deviceId]); }
    /** @return array<int, array<string, mixed>> */
    public function forParent(int $parentId): array { return $this->all('SELECT * FROM kids WHERE parent_user_id = ? ORDER BY id DESC', [$parentId]); }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function paginate(int $limit, int $offset): array
    {
        return [
            'items' => $this->all('SELECT k.*, u.name AS parent_name FROM kids k JOIN users u ON u.id = k.parent_user_id ORDER BY k.id DESC LIMIT ? OFFSET ?', [$limit, $offset]),
            'total' => $this->count('SELECT COUNT(*) AS total FROM kids'),
        ];
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createKid(array $data): array { $id = $this->insert('kids', $data); return $this->find($id) ?? throw new \RuntimeException('Child creation failed.'); }
    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateKid(int $id, array $data): ?array { $this->update('kids', $id, $data); return $this->find($id); }
    public function deleteKid(int $id): bool { return $this->execute('DELETE FROM kids WHERE id = ?', [$id]) > 0; }

    /** @return array<string, mixed> */
    public function riderSafe(array $kid): array
    {
        $name = trim((string) ($kid['name'] ?? ''));
        $parts = preg_split('/\s+/', $name) ?: [];
        return [
            'id' => $kid['id'],
            'display_name' => ($parts[0] ?? 'Passenger') . (isset($parts[1]) ? ' ' . strtoupper(substr($parts[1], 0, 1)) . '.' : ''),
            'school' => $kid['school'] ?? null,
            'grade' => $kid['grade'] ?? null,
        ];
    }
}
