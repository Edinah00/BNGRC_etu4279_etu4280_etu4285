<?php

declare(strict_types=1);

use flight\net\Router;
use app\controllers\RapportController;


$router->group('', function (Router $router) use ($app) {
    
    $router->get('/rapport', function(): void {
        Flight::render('rapport');
    });
    
    $router->group('/api/rapport', function (Router $router) {
        $router->get('', function(): void {
            RapportController::index();
        });
        
        $router->get('/summary', function(): void {
            RapportController::getSummary();
        });
        
        $router->get('/by-type', function(): void {
            RapportController::getByType();
        });
        
        $router->get('/by-region', function(): void {
            RapportController::getByRegion();
        });
        
        $router->get('/by-city', function(): void {
            RapportController::getByCity();
        });
        
        $router->get('/timeline', function(): void {
            RapportController::getTimeline();
        });
        
        $router->get('/export/pdf', function(): void {
            RapportController::exportPdf();
        });
    });
});
