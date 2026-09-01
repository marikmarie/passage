<?php

declare(strict_types=1);

namespace App\Core;

abstract class Controller
{
    protected function requireFields(Request $request, array $fields): void
    {
        foreach ($fields as $field) {
            $value = $request->input($field);
            if ($value === null || $value === '') {
                throw new ApiException("{$field} is required.", 422, 'VALIDATION_ERROR');
            }
        }
    }

    protected function id(Request $request, string $name = 'id'): int
    {
        $value = filter_var($request->param($name), FILTER_VALIDATE_INT);
        if ($value === false || $value < 1) {
            throw new ApiException("Invalid {$name}.", 422, 'VALIDATION_ERROR');
        }
        return $value;
    }

    /** @return array{page:int,limit:int,offset:int} */
    protected function page(Request $request, int $maximum = 100): array
    {
        $page = max(1, (int) $request->input('page', 1));
        $limit = min($maximum, max(1, (int) $request->input('limit', 10)));
        return ['page' => $page, 'limit' => $limit, 'offset' => ($page - 1) * $limit];
    }

    /** @return array<string, mixed> */
    protected function user(Request $request): array
    {
        $user = $request->user();
        if ($user === null) {
            throw new ApiException('Access denied. No token provided.', 401, 'NO_TOKEN');
        }
        return $user;
    }
}
