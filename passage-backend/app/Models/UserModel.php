<?php

declare(strict_types=1);

namespace App\Models;

final class UserModel extends BaseModel
{
    protected array $fillable = ['name', 'email', 'phone_number', 'alternative_phone_number', 'national_id_number', 'password_hash', 'role', 'status', 'otp_code', 'otp_expires_at', 'terms_accepted_at', 'privacy_consent_at'];

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array { return $this->one('SELECT * FROM users WHERE id = ?', [$id]); }
    /** @return array<string, mixed>|null */
    public function findByEmail(string $email): ?array { return $this->one('SELECT * FROM users WHERE email = ?', [strtolower($email)]); }
    /** @return array<string, mixed>|null */
    public function findByPhone(string $phone): ?array { return $this->one('SELECT * FROM users WHERE phone_number = ?', [$phone]); }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    public function create(array $data): array
    {
        $id = $this->insert('users', $data);
        return $this->find($id) ?? throw new \RuntimeException('User creation failed.');
    }

    /** @param array<string, mixed> $data @return array<string, mixed>|null */
    public function updateUser(int $id, array $data): ?array
    {
        $this->update('users', $id, $data);
        return $this->find($id);
    }

    /** @return array{items:array<int, array<string, mixed>>,total:int} */
    public function paginate(int $limit, int $offset, ?string $role = null): array
    {
        $where = $role !== null ? ' WHERE role = ?' : '';
        $params = $role !== null ? [$role, $limit, $offset] : [$limit, $offset];
        return [
            'items' => $this->all("SELECT id, name, email, phone_number, role, status, created_at, updated_at FROM users{$where} ORDER BY id DESC LIMIT ? OFFSET ?", $params),
            'total' => $this->count("SELECT COUNT(*) AS total FROM users{$where}", $role !== null ? [$role] : []),
        ];
    }

    public function deleteUser(int $id): bool { return $this->execute('DELETE FROM users WHERE id = ?', [$id]) > 0; }

    /** @return array<string, mixed> */
    public function withoutSecrets(array $user): array
    {
        unset($user['password_hash'], $user['otp_code'], $user['otp_expires_at']);
        return $user;
    }
}
