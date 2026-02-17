<?php

use app\controllers\DashboardController;

$router->get('/', function (){
    Flight::redirect('/dashboard');
});

$router->get('/dashboard', function (){
    $controller = new DashboardController();
    $controller->index();
});

$router->get('/api/dashboard', function (){
    $controller = new DashboardController();
    $controller->data();
});
