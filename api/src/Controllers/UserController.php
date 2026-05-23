<?php
namespace App\Controllers;

use App\Database;

class UserController
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function index(array $params, array $body): array
    {
        $stmt = $this->db->query('SELECT id, name, email, phone, cep, street, neighborhood, city, state, complement, created_at FROM users ORDER BY id');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function store(array $params, array $body): array
    {
        $required = ['name', 'email', 'password', 'cep', 'street', 'city', 'state'];
        foreach ($required as $field) {
            if (empty(trim((string) ($body[$field] ?? '')))) {
                http_response_code(400);
                return ['error' => "O campo {$field} é obrigatório."];
            }
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido.'];
        }

        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, phone, password, cep, street, neighborhood, city, state, complement) VALUES (:name, :email, :phone, :password, :cep, :street, :neighborhood, :city, :state, :complement)'
        );

        $stmt->execute([
            ':name'       => $body['name'],
            ':email'      => $body['email'],
            ':phone'      => $body['phone'] ?? null,
            ':password'   => password_hash($body['password'], PASSWORD_BCRYPT),
            ':cep'        => $body['cep'],
            ':street'     => $body['street'],
            ':neighborhood' => $body['neighborhood'],
            ':city'       => $body['city'],
            ':state'      => $body['state'],
            ':complement' => $body['complement'] ?? null,
        ]);

        $id = (int) $this->db->lastInsertId();

        http_response_code(201);
        return [
            'id' => $id,
            'name' => $body['name'],
            'email' => $body['email'],
            'phone' => $body['phone'] ?? null,
            'cep' => $body['cep'],
            'street' => $body['street'],
            'neighborhood' => $body['neighborhood'],
            'city' => $body['city'],
            'state' => $body['state'],
            'complement' => $body['complement'] ?? null,
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }

    public function show(array $params, array $body): array
    {
        $stmt = $this->db->prepare('SELECT id, name, email, phone, cep, street, neighborhood, city, state, complement FROM users WHERE id = :id');
        $stmt->execute([':id' => $params['id']]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }

        return $user;
    }

    public function update(array $params, array $body): array
    {
        $stmt = $this->db->prepare(
            'UPDATE users SET name = :name, email = :email, phone = :phone, cep = :cep, street = :street, neighborhood = :neighborhood, city = :city, state = :state, complement = :complement WHERE id = :id'
        );

        $stmt->execute([
            ':name'         => $body['name'] ?? null,
            ':email'        => $body['email'] ?? null,
            ':phone'        => $body['phone'] ?? null,
            ':cep'          => $body['cep'] ?? null,
            ':street'       => $body['street'] ?? null,
            ':neighborhood' => $body['neighborhood'] ?? null,
            ':city'         => $body['city'] ?? null,
            ':state'        => $body['state'] ?? null,
            ':complement'   => $body['complement'] ?? null,
            ':id'           => $params['id'],
        ]);

        return ['message' => 'User updated'];
    }

    public function destroy(array $params, array $body): array
    {
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $params['id']]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }

        return ['message' => 'User deleted'];
    }
}