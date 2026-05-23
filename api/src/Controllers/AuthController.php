<?php
namespace App\Controllers;

use App\Database;

class AuthController
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function login(array $params, array $body): array
    {
        $stmt = $this->db->prepare('SELECT id, name, email, password FROM users WHERE email = :email');
        $stmt->execute([':email' => $body['email']]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || !password_verify($body['password'] ?? '', $user['password'])) {
            http_response_code(401);
            return ['error' => 'Invalid credentials'];
        }

        return [
            'token' => base64_encode($user['email'] . ':' . time()),
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
            ],
        ];
    }

    public function register(array $params, array $body): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, phone, password) VALUES (:name, :email, :phone, :password)'
        );

        $stmt->execute([
            ':name'     => $body['name'],
            ':email'    => $body['email'],
            ':phone'    => $body['phone'] ?? null,
            ':password' => password_hash($body['password'], PASSWORD_BCRYPT),
        ]);

        $id = (int) $this->db->lastInsertId();

        http_response_code(201);
        return [
            'token' => base64_encode($body['email'] . ':' . time()),
            'user' => [
                'id' => $id,
                'name' => $body['name'],
                'email' => $body['email'],
            ],
        ];
    }
}
