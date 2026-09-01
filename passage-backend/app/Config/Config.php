<?php

declare(strict_types=1);

namespace App\Config;

/** Loads local configuration without requiring a third-party dotenv package. */
final class Config
{
    /** @var array<string, string> */
    private static array $values = [];
    private static bool $loaded = false;

    public static function load(string $path): void
    {
        if (self::$loaded) {
            return;
        }

        self::$loaded = true;
        if (!is_file($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if ((str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }
            self::$values[$key] = $value;
        }
    }

    public static function get(string $key, string|int|bool|null $default = null): string|int|bool|null
    {
        $environment = getenv($key);
        if ($environment !== false && $environment !== '') {
            return $environment;
        }

        return self::$values[$key] ?? $default;
    }

    public static function isProduction(): bool
    {
        return self::get('APP_ENV', self::get('NODE_ENV', 'development')) === 'production';
    }
}
