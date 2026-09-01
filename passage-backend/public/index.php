<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Config\Config;
use App\Core\ApiException;
use App\Core\Request;
use App\Core\Response;

$allowedOrigin = (string) \App\Config\Config::get('CORS_ORIGIN', '*');
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$router = require dirname(__DIR__) . '/routes/web.php';

try {
    $router->dispatch(Request::fromGlobals());
} catch (ApiException $exception) {
    Response::error($exception->getMessage(), $exception->status(), $exception->errorCode());
} catch (Throwable $exception) {
    error_log((string) $exception);
    Response::error(
        Config::isProduction() ? 'An unexpected error occurred.' : $exception->getMessage(),
        500,
        'INTERNAL_ERROR'
    );
}
