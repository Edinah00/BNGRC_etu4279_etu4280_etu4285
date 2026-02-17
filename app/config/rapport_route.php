<?php

use flight\Engine;

$router->get('/rapport', fn() => $app->render('model', ['page' => 'rapport']));

$router->get('/api/rapport', function () {
    $controller = new \app\controllers\RapportController();
    $controller->index();
});

$router->get('/api/rapport/summary', function () {
    $controller = new \app\controllers\RapportController();
    $controller->getSummary();
});

$router->get('/api/rapport/by-type', function () {
    $controller = new \app\controllers\RapportController();
    $controller->getByType();
});

$router->get('/api/rapport/by-region', function () {
    $controller = new \app\controllers\RapportController();
    $controller->getByRegion();
});

$router->get('/api/rapport/by-city', function () {
    $controller = new \app\controllers\RapportController();
    $controller->getByCity();
});

$router->get('/api/rapport/timeline', function () {
    $controller = new \app\controllers\RapportController();
    $controller->getTimeline();
});

$router->get('/api/rapport/export/pdf', function () {
    $controller = new \app\controllers\RapportController();
    $controller->exportPdf();
});