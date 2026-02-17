<?php

use app\controllers\DispatchController;
use app\middlewares\SecurityHeadersMiddleware;
use flight\Engine;
use flight\net\Router;

/** @var Engine $app */

$router->group('', function (Router $router) use ($app) {

    $router->get('/dispatch', fn() => $app->render('model', ['page' => 'dispatch']));

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

        $router->post('/reset-data', function () {
            $controller = new DispatchController();
            $controller->resetData();
            exit();
        });
        
    });

}, [SecurityHeadersMiddleware::class]);