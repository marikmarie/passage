<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;
use Throwable;

final class ApiException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $status = 400,
        private readonly string $errorCode = 'BAD_REQUEST',
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $status, $previous);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }
}
