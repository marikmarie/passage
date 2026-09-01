<?php

declare(strict_types=1);

namespace App\Core;

use App\Config\Config;

final class Application
{
    private static bool $booted = false;

    public static function boot(): void
    {
        if (self::$booted) {
            return;
        }

        self::$booted = true;
        date_default_timezone_set((string) Config::get('APP_TIMEZONE', 'Africa/Kampala'));
        error_reporting(E_ALL);
        ini_set('display_errors', Config::isProduction() ? '0' : '1');
        ini_set('display_startup_errors', Config::isProduction() ? '0' : '1');
    }

    public static function run(): never
    {
        self::sendCorsHeaders();

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $router = require BASE_PATH . '/routes/web.php';

        try {
            $router->dispatch(Request::fromGlobals());
        } catch (ApiException $exception) {
            Response::error($exception->getMessage(), $exception->status(), $exception->errorCode());
        } catch (\Throwable $exception) {
            error_log((string) $exception);
            Response::error(
                Config::isProduction() ? 'An unexpected error occurred.' : $exception->getMessage(),
                500,
                'INTERNAL_ERROR'
            );
        }
    }

    private static function sendCorsHeaders(): void
    {
        header('Access-Control-Allow-Origin: ' . (string) Config::get('CORS_ORIGIN', '*'));
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }
}
