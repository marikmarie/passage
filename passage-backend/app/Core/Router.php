<?php

declare(strict_types=1);

namespace App\Core;

use Closure;

final class Router
{
    /** @var array<int, array{method:string, path:string, handler:callable, middleware:array<int, callable>}> */
    private array $routes = [];

    /** @param callable(Request): mixed $handler @param array<int, callable(Request): void> $middleware */
    public function add(string $method, string $path, callable $handler, array $middleware = []): self
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => rtrim($path, '/') ?: '/',
            'handler' => $handler,
            'middleware' => $middleware,
        ];
        return $this;
    }

    public function dispatch(Request $request): never
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $request->method()) {
                continue;
            }

            $params = $this->match($route['path'], $request->path());
            if ($params === null) {
                continue;
            }

            $request->setParams($params);
            foreach ($route['middleware'] as $middleware) {
                $middleware($request);
            }

            ($route['handler'])($request);
            Response::error('Route handler did not send a response.', 500, 'HANDLER_ERROR');
        }

        if (str_starts_with($request->path(), '/api')) {
            Response::error('Endpoint not found.', 404, 'NOT_FOUND');
        }
        Response::view('errors/404', ['path' => $request->path()], 404);
    }

    /** @return array<string, string>|null */
    private function match(string $routePath, string $requestPath): ?array
    {
        $routeParts = $routePath === '/' ? [] : explode('/', trim($routePath, '/'));
        $requestParts = $requestPath === '/' ? [] : explode('/', trim($requestPath, '/'));
        if (count($routeParts) !== count($requestParts)) { return null; }
        $params = [];
        foreach ($routeParts as $index => $part) {
            if (preg_match('/^\{([A-Za-z][A-Za-z0-9_]*)\}$/', $part, $matches)) {
                $params[$matches[1]] = urldecode($requestParts[$index]);
                continue;
            }
            if ($part !== $requestParts[$index]) { return null; }
        }
        return $params;
    }
}
