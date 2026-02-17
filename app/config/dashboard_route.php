<?php

use flight\Engine;

$router->get('/', fn() => $app->render('model', ['page' => 'dashboard']));
$router->get('/dashboard', fn() => $app->render('model', ['page' => 'dashboard']));

$router->get('/api/dashboard', function () {
    $controller = new \app\controllers\DashboardController();
    $controller->data();
});