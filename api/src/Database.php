<?php
namespace App;

class Database
{
    private static ?\PDO $instance = null;

    public static function connect(): \PDO
    {
        if (self::$instance) return self::$instance;

        $dsn = sprintf(
            'mysql:host=%s;port=3306;dbname=%s;charset=utf8mb4',
            $_ENV['DB_HOST'] ?? 'db',
            $_ENV['DB_NAME'] ?? 'app'
        );

        self::$instance = new \PDO($dsn, $_ENV['DB_USER'] ?? null, $_ENV['DB_PASS'] ?? null, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        return self::$instance;
    }
}
