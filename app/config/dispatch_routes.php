<?php

use app\controllers\DispatchController;
use app\middlewares\SecurityHeadersMiddleware;
use flight\net\Router;

$router->group('', function (Router $router) {
    $router->get('/dispatch', function () {
        $controller = new DispatchController();
        $controller->index();
        exit();
    });

    $router->get('/dispach', function () {
        $controller = new DispatchController();
        $controller->index();
        exit();
    });

    $router->group('/api/dispatch', function (Router $router) {
        $router->get('/simulate', function () {
            $controller = new DispatchController();
            $controller->simulate();
            exit();
        });

        $router->get('/eligible-cities/@idType', function ($idType) {
            $controller = new DispatchController();
            $controller->eligibleCities($idType);
            exit();
        });

        $router->post('/validate', function () {
            $controller = new DispatchController();
            $controller->validateDraft();
            exit();
        });
    });
}, [SecurityHeadersMiddleware::class]);
