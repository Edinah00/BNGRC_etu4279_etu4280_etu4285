<?php

use app\controllers\DispatchController;
use app\middlewares\SecurityHeadersMiddleware;
use flight\net\Router;

$router->group('', function (Router $router) {
    $router->get('/dispatch', function () {
        DispatchController::index();
        exit();
    });

    // Alias de compatibilite (orthographe frequente)
    $router->get('/dispach', function () {
        DispatchController::index();
        exit();
    });
}, [SecurityHeadersMiddleware::class]);

$router->group('/api/dispatch', function (Router $router) {
    $router->get('/simulate', function () {
        DispatchController::simulate();
        exit();
    });

    $router->get('/eligible-cities/@idType', function ($idType) {
        DispatchController::eligibleCities($idType);
        exit();
    });

    $router->post('/validate', function () {
        DispatchController::validateDraft();
        exit();
    });
}, [SecurityHeadersMiddleware::class]);
