<?php

declare(strict_types=1);

namespace App\Core;

final class Response
{
    /** @param mixed $data */
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        exit;
    }

    /** @param mixed $data */
    public static function success(string $message, mixed $data = null, int $status = 200): never
    {
        self::json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    /** @param array<int, mixed> $data */
    public static function paginated(string $message, array $data, int $total, int $page, int $limit): never
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total / max($limit, 1)),
            ],
        ]);
    }

    /** @param array<string, mixed> $extra */
    public static function error(string $message, int $status = 400, string $code = 'BAD_REQUEST', array $extra = []): never
    {
        self::json(array_merge(['success' => false, 'message' => $message, 'code' => $code], $extra), $status);
    }

    /** @param array<string, mixed> $data */
    public static function view(string $view, array $data = [], int $status = 200): never
    {
        $viewPath = dirname(__DIR__) . '/Views/' . $view . '.php';
        if (!is_file($viewPath)) {
            throw new ApiException('View not found.', 500, 'VIEW_NOT_FOUND');
        }

        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
        extract($data, EXTR_SKIP);
        require $viewPath;
        exit;
    }
}
