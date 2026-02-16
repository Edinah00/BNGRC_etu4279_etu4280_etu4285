<?php

use flight\net\Router;
use app\controllers\EchangeController;

$router->group('', function (Router $router) use ($app) {
    $router->get('/echanges', function(){
        EchangeController::index();
        exit();
    });
    
    // Routes API pour les actions AJAX
    $router->group('/api/echanges', function (Router $router) {
        // Créer un nouvel échange
        $router->post('', function() {
            $result = EchangeController::create();
            Flight::json($result);
            exit();
        });
        
        // Accepter un échange
        $router->put('/@id:[0-9]+/accept', function($id) {
            $result = EchangeController::accept($id);
            Flight::json($result);
            exit();                             

        });
        
        // Refuser un échange
        $router->put('/@id:[0-9]+/refuse', function($id) {
            $result = EchangeController::refuse($id);
            Flight::json($result);
            exit();
        });
        
        // Annuler un échange
        $router->delete('/@id:[0-9]+/cancel', function($id) {
            $result = EchangeController::cancel($id);
            Flight::json($result);
            exit();
        });
    });
}, [SecurityHeadersMiddleware::class]);