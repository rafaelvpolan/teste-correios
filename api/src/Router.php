<?php
namespace App;

class Router
{
    private array $routes = [];

    public function get(string $path, mixed $handler): void
    {
        $this->routes[] = ['GET', $path, $handler];
    }

    public function post(string $path, mixed $handler): void
    {
        $this->routes[] = ['POST', $path, $handler];
    }

    public function put(string $path, mixed $handler): void
    {
        $this->routes[] = ['PUT', $path, $handler];
    }

    public function delete(string $path, mixed $handler): void
    {
        $this->routes[] = ['DELETE', $path, $handler];
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        foreach ($this->routes as [$routeMethod, $routePath, $handler]) {
            if ($routeMethod !== $method) continue;

            $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $routePath);
            if (!preg_match("#^{$pattern}$#", $uri, $matches)) continue;

            // Params da URL
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            // Body JSON
            $body = json_decode(file_get_contents('php://input'), true) ?? [];

            if (is_callable($handler)) {
                echo json_encode($handler($params, $body));
                return;
            }

            [$class, $action] = $handler;
            $controller = new $class();
            echo json_encode($controller->$action($params, $body));
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}