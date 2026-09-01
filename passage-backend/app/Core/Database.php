<?php

declare(strict_types=1);

namespace App\Core;

use App\Config\Config;
use PDO;
use PDOException;

final class Database
{
    private static ?PDO $connection = null;

    /** @var array<string, string> */
    private const TABLES = [
        'users' => 'tbl_users',
        'riders' => 'tbl_riders',
        'devices' => 'tbl_devices',
        'kids' => 'tbl_kids',
        'trips' => 'tbl_trips',
        'rider_availability' => 'tbl_rider_availability',
        'ride_requests' => 'tbl_ride_requests',
        'watch_verification_tokens' => 'tbl_watch_verification_tokens',
        'tracking_logs' => 'tbl_tracking_logs',
        'geofences' => 'tbl_geofences',
        'alerts' => 'tbl_alerts',
        'notifications' => 'tbl_notifications',
        'payments' => 'tbl_payments',
        'wallets' => 'tbl_wallets',
        'wallet_transactions' => 'tbl_wallet_transactions',
        'payout_requests' => 'tbl_payout_requests',
        'subscriptions' => 'tbl_subscriptions',
        'audit_logs' => 'tbl_audit_logs',
    ];

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $host = (string) Config::get('DB_HOST', '127.0.0.1');
        $port = (string) Config::get('DB_PORT', '3306');
        $database = (string) Config::get('DB_NAME', 'passage_db');
        $charset = (string) Config::get('DB_CHARSET', 'utf8mb4');

        try {
            self::$connection = new PDO(
                "mysql:host={$host};port={$port};dbname={$database};charset={$charset}",
                (string) Config::get('DB_USER', 'root'),
                (string) Config::get('DB_PASSWORD', ''),
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $exception) {
            throw new ApiException('Database connection failed. Check the PHP PDO MySQL extension and database settings.', 500, 'DATABASE_UNAVAILABLE', $exception);
        }

        return self::$connection;
    }

    public static function table(string $logicalName): string
    {
        if (!isset(self::TABLES[$logicalName])) {
            throw new \InvalidArgumentException("Unknown database table: {$logicalName}");
        }

        return self::TABLES[$logicalName];
    }

    /**
     * Keeps SQL readable while ensuring every physical database table uses the tbl_ prefix.
     */
    public static function prefixTables(string $sql): string
    {
        $names = array_map(static fn (string $name): string => preg_quote($name, '/'), array_keys(self::TABLES));
        return (string) preg_replace_callback(
            '/\\b(' . implode('|', $names) . ')\\b/',
            static fn (array $match): string => self::table($match[1]),
            $sql
        );
    }
}
