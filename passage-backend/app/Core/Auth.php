<?php

declare(strict_types=1);

namespace App\Core;

use App\Models\DeviceModel;

final class Auth
{
    /** @return callable(Request): void */
    public static function bearer(): callable
    {
        return static function (Request $request): void {
            $token = self::bearerToken($request);
            if ($token === null) {
                throw new ApiException('Access denied. No token provided.', 401, 'NO_TOKEN');
            }
            $request->setUser(Jwt::decode($token));
        };
    }

    /** @param array<int, string> $roles @return callable(Request): void */
    public static function roles(array $roles): callable
    {
        return static function (Request $request) use ($roles): void {
            $user = $request->user();
            if ($user === null || !in_array((string) ($user['role'] ?? ''), $roles, true)) {
                throw new ApiException('Forbidden. You do not have the required permissions.', 403, 'INSUFFICIENT_PERMISSIONS');
            }
        };
    }

    /** @return callable(Request): void */
    public static function device(): callable
    {
        return static function (Request $request): void {
            $token = self::bearerToken($request);
            if ($token === null) {
                throw new ApiException('Access denied. No device token provided.', 401, 'NO_DEVICE_TOKEN');
            }

            $device = (new DeviceModel())->findByToken($token);
            if ($device === null) {
                throw new ApiException('Invalid device token.', 401, 'INVALID_DEVICE_TOKEN');
            }
            if (in_array(strtolower((string) $device['status']), ['inactive', 'disabled', 'lost', 'damaged'], true)) {
                throw new ApiException('Device is not allowed to access watch endpoints.', 403, 'DEVICE_NOT_ALLOWED');
            }

            $requestedId = $request->param('deviceId') ?? $request->input('deviceId');
            if ($requestedId !== null && (string) $requestedId !== (string) $device['id'] && (string) $requestedId !== (string) $device['imei']) {
                throw new ApiException('Device token does not match the requested device.', 403, 'DEVICE_MISMATCH');
            }
            $request->setDevice($device);
        };
    }

    private static function bearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header === null || !preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return null;
        }
        return trim($matches[1]);
    }
}
