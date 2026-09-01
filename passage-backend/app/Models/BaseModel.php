<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

abstract class BaseModel
{
    /** @var array<int, string> */
    protected array $fillable = [];

    protected function db(): PDO
    {
        return Database::connection();
    }

    /** @param array<int, mixed> $params @return array<string, mixed>|null */
    protected function one(string $sql, array $params = []): ?array
    {
        $statement = $this->db()->prepare(Database::prefixTables($sql));
        $statement->execute($params);
        $result = $statement->fetch();
        return $result === false ? null : $result;
    }

    /** @param array<int, mixed> $params @return array<int, array<string, mixed>> */
    protected function all(string $sql, array $params = []): array
    {
        $statement = $this->db()->prepare(Database::prefixTables($sql));
        $statement->execute($params);
        return $statement->fetchAll();
    }

    /** @param array<int, mixed> $params */
    protected function execute(string $sql, array $params = []): int
    {
        $statement = $this->db()->prepare(Database::prefixTables($sql));
        $statement->execute($params);
        return $statement->rowCount();
    }

    /** @param array<string, mixed> $input @return array<string, mixed> */
    protected function allowed(array $input): array
    {
        return array_filter(
            $input,
            fn (string $field): bool => in_array($field, $this->fillable, true),
            ARRAY_FILTER_USE_KEY
        );
    }

    /** @param array<string, mixed> $data */
    protected function insert(string $table, array $data): int
    {
        $data = $this->allowed($data);
        $columns = array_keys($data);
        if ($columns === []) {
            throw new \InvalidArgumentException('No valid fields were supplied.');
        }
        $statement = $this->db()->prepare(
            'INSERT INTO ' . Database::table($table) . ' (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')'
        );
        $statement->execute(array_values($data));
        return (int) $this->db()->lastInsertId();
    }

    /** @param array<string, mixed> $data */
    protected function update(string $table, int $id, array $data): bool
    {
        $data = $this->allowed($data);
        if ($data === []) {
            return false;
        }
        $assignments = array_map(static fn (string $column): string => "{$column} = ?", array_keys($data));
        $statement = $this->db()->prepare('UPDATE ' . Database::table($table) . ' SET ' . implode(', ', $assignments) . ', updated_at = NOW() WHERE id = ?');
        $statement->execute([...array_values($data), $id]);
        return $statement->rowCount() > 0;
    }

    protected function count(string $sql, array $params = []): int
    {
        $row = $this->one($sql, $params);
        return (int) ($row['total'] ?? 0);
    }
}
