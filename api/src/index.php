<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Router;

// Headers de CORS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$router = new Router();

$router->get('/health', fn() => ['status' => 'ok', 'php' => PHP_VERSION]);

$router->get('/cep/{cep}',      [App\Controllers\CorreiosController::class, 'lookup']);
$router->get('/users',         [App\Controllers\UserController::class, 'index']);
$router->post('/users',        [App\Controllers\UserController::class, 'store']);
$router->get('/users/{id}',    [App\Controllers\UserController::class, 'show']);
$router->put('/users/{id}',    [App\Controllers\UserController::class, 'update']);
$router->delete('/users/{id}', [App\Controllers\UserController::class, 'destroy']);

$router->post('/auth/login',    [App\Controllers\AuthController::class, 'login']);
$router->post('/auth/register', [App\Controllers\AuthController::class, 'register']);

$router->dispatch();