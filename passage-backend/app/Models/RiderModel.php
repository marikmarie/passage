<?php

declare(strict_types=1);

namespace App\Models;

final class RiderModel extends BaseModel
{
    protected array $fillable = [
        'user_id', 'parent_user_id', 'school', 'grade', 'full_name', 'date_of_birth', 'nationality',
        'national_id_number', 'national_id_front_url', 'national_id_back_url', 'profile_photo_url', 'driving_licence_image_url',
        'residential_area', 'stage_association', 'driving_licence_number', 'permit_number',
        'licence_expiry_date', 'years_of_riding', 'authorised_vehicle_class', 'vehicle_type',
        'number_plate', 'permit_image_url', 'vehicle_photo_url', 'ownership_status', 'insurance_info', 'insurance_expiry_date',
        'verification_consent_accepted', 'training_accepted', 'safeguarding_accepted',
        'approval_status', 'submitted_at', 'reviewed_by', 'reviewed_at', 'review_note',
    ];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array { return $this->one('SELECT r.*, u.name, u.email, u.phone_number, u.status AS user_status FROM riders r JOIN users u ON u.id = r.user_id WHERE r.id = ?', [$id]); }
    /** @return array<string, mixed>|null */
    public function findByUser(int $userId): ?array { return $this->one('SELECT r.*, u.name, u.email, u.phone_number, u.status AS user_status FROM riders r JOIN users u ON u.id = r.user_id WHERE r.user_id = ?', [$userId]); }
    /** @return array<int, array<string, mixed>> */
    public function forParent(int $parentId): array { return $this->all('SELECT r.*, u.name, u.phone_number FROM riders r JOIN users u ON u.id = r.user_id WHERE r.parent_user_id = ?', [$parentId]); }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function createRider(array $data): array { $id = $this->insert('riders', $data); return $this->find($id) ?? throw new \RuntimeException('Rider creation failed.'); }
    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateRider(int $id, array $data): ?array { $this->update('riders', $id, $data); return $this->find($id); }
    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function upsertForUser(int $userId, array $data): array
    {
        $existing = $this->findByUser($userId);
        if ($existing === null) { return $this->createRider(['user_id' => $userId, ...$data]); }
        return $this->updateRider((int) $existing['id'], $data) ?? throw new \RuntimeException('Rider update failed.');
    }
    public function deleteRider(int $id): bool { return $this->execute('DELETE FROM riders WHERE id = ?', [$id]) > 0; }
}
