<?php

declare(strict_types=1);

namespace App\Core;

use App\Config\Config;

final class Jwt
{
    /** @param array<string, mixed> $payload */
    public static function encode(array $payload, int $expiresInSeconds = 86400): string
    {
        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $expiresInSeconds;
        $header = self::base64Url(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $body = self::base64Url(json_encode($payload, JSON_THROW_ON_ERROR));
        $signature = self::base64Url(hash_hmac('sha256', "{$header}.{$body}", self::secret(), true));
        return "{$header}.{$body}.{$signature}";
    }

    /** @return array<string, mixed> */
    public static function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new ApiException('Invalid or malformed token.', 403, 'INVALID_TOKEN');
        }
        [$header, $body, $signature] = $parts;
        $expected = self::base64Url(hash_hmac('sha256', "{$header}.{$body}", self::secret(), true));
        if (!hash_equals($expected, $signature)) {
            throw new ApiException('Invalid or malformed token.', 403, 'INVALID_TOKEN');
        }

        $payload = json_decode(self::base64UrlDecode($body), true);
        if (!is_array($payload)) {
            throw new ApiException('Invalid or malformed token.', 403, 'INVALID_TOKEN');
        }
        if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
            throw new ApiException('Token has expired.', 401, 'TOKEN_EXPIRED');
        }
        return $payload;
    }

    private static function secret(): string
    {
        $secret = (string) Config::get('JWT_SECRET', '');
        if ($secret === '' || $secret === 'your_super_secret_jwt_key_here_change_in_production') {
            throw new ApiException('JWT_SECRET must be configured.', 500, 'CONFIGURATION_ERROR');
        }
        return $secret;
    }

    private static function base64Url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }
        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }
}
