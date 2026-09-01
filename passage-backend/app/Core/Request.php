<?php

declare(strict_types=1);

namespace App\Core;

final class Request
{
    /** @var array<string, mixed> */
    private array $body;
    /** @var array<string, string> */
    private array $params = [];
    /** @var array<string, mixed>|null */
    private ?array $user = null;
    /** @var array<string, mixed>|null */
    private ?array $device = null;

    public function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $query,
        array $body,
        private readonly array $server,
    ) {
        $this->body = $body;
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $rawBody = file_get_contents('php://input');
        $body = $_POST;

        $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
        if (str_contains($contentType, 'application/json') && $rawBody !== false && $rawBody !== '') {
            $decoded = json_decode($rawBody, true);
            if (!is_array($decoded)) {
                throw new ApiException('The request body must contain valid JSON.', 400, 'INVALID_JSON');
            }
            $body = $decoded;
        }

        return new self($method, rtrim($path, '/') ?: '/', $_GET, $body, $_SERVER);
    }

    public function method(): string { return $this->method; }
    public function path(): string { return $this->path; }
    /** @return array<string, mixed> */
    public function body(): array { return $this->body; }
    /** @return array<string, mixed> */
    public function query(): array { return $this->query; }
    /** @return array<string, string> */
    public function params(): array { return $this->params; }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $this->server[$key] ?? ($name === 'Content-Type' ? ($this->server['CONTENT_TYPE'] ?? null) : null);
    }

    /** @param array<string, string> $params */
    public function setParams(array $params): void { $this->params = $params; }
    public function param(string $key, ?string $default = null): ?string { return $this->params[$key] ?? $default; }

    /** @param array<string, mixed> $user */
    public function setUser(array $user): void { $this->user = $user; }
    /** @return array<string, mixed>|null */
    public function user(): ?array { return $this->user; }

    /** @param array<string, mixed> $device */
    public function setDevice(array $device): void { $this->device = $device; }
    /** @return array<string, mixed>|null */
    public function device(): ?array { return $this->device; }
}
