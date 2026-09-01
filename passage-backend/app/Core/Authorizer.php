<?php

declare(strict_types=1);

namespace App\Core;

final class Authorizer
{
    /** @param array<string, mixed> $user */
    public static function canAccessDevice(array $user, int $deviceId): bool
    {
        if (in_array((string) $user['role'], ['admin', 'support'], true)) { return true; }
        $db = Database::connection();
        if ($user['role'] === 'parent') {
            $statement = $db->prepare(Database::prefixTables('SELECT 1 FROM kids WHERE device_id = ? AND parent_user_id = ? LIMIT 1'));
            $statement->execute([$deviceId, (int) $user['id']]);
            return $statement->fetchColumn() !== false;
        }
        if ($user['role'] === 'rider') {
            $statement = $db->prepare(Database::prefixTables("SELECT 1 FROM trips t JOIN riders r ON r.id = t.rider_id WHERE t.device_id = ? AND r.user_id = ? AND t.status IN ('awaiting_pickup', 'active') LIMIT 1"));
            $statement->execute([$deviceId, (int) $user['id']]);
            return $statement->fetchColumn() !== false;
        }
        return false;
    }

    /** @param array<string, mixed> $user */
    public static function assertDevice(array $user, int $deviceId): void
    {
        if (!self::canAccessDevice($user, $deviceId)) {
            throw new ApiException('You do not have permission to access this device.', 403, 'FORBIDDEN');
        }
    }

    /** @param array<string, mixed> $user */
    public static function assertOwnerOrPrivileged(array $user, int $ownerUserId): void
    {
        if ((int) $user['id'] !== $ownerUserId && !in_array((string) $user['role'], ['admin', 'support'], true)) {
            throw new ApiException('You do not have permission to access this resource.', 403, 'FORBIDDEN');
        }
    }
}
