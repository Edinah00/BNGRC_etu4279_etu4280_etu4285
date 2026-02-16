<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/DashboardModel.php';
require_once __DIR__ . '/../controllers/DashboardController.php';

$router->get('/', function (): void {
    Flight::redirect('/dashboard');
});

$router->get('/dashboard', function (): void {
    $controller = new DashboardController(new DashboardModel(Flight::db()));
    $controller->index();
});

$router->get('/api/dashboard', function (): void {
    $controller = new DashboardController(new DashboardModel(Flight::db()));
    $controller->apiData();
});
