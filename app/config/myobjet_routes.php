<?php
use flight\net\Router;
use app\controllers\ObjetController;
use app\controllers\UploadController;
use app\middlewares\SecurityHeadersMiddleware;

$router->group('', function (Router $router) use ($app) {
    $router->get('/mes-objets', function(){
        ObjetController::index();
        exit();
    });

    $router->post('/api/upload-image', [UploadController::class, 'upload']);

    $router->group('/api/mes-objets', function (Router $router) {
        $router->get('', [ObjetController::class, 'listMine']);
        
        $router->post('', [ObjetController::class, 'create']);
        
        $router->get('/@id:[0-9]+/similar', [ObjetController::class, 'getByPriceRange']);
        
        $router->put('/@id:[0-9]+', [ObjetController::class, 'update']);
        
        $router->delete('/@id:[0-9]+', [ObjetController::class, 'delete']);
    });

}, [SecurityHeadersMiddleware::class]);
