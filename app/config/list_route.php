<?php
use flight\net\Router;
use flight\Engine;
use app\controllers\UserController;
use app\controllers\MessageController;
use app\controllers\AccueilController;
use app\controllers\CatalogueController;
use app\controllers\ObjetController;
use app\middlewares\SecurityHeadersMiddleware;

$router->group('', function (Router $router) use ($app) {
    // Page d'accueil
    $router->get('/accueil', function(){
        AccueilController::index();
        exit();
    });
    
    // Page catalogue
    $router->get('/catalogue', function(){
        CatalogueController::index();
        exit();
    });
    
    // Page détails d'un produit avec historique
    $router->get('/produit/@id', function($id) {
        ObjetController::show($id);
        exit();
    });
    
    // Route pour récupérer les objets avec filtres
    $router->get('/api/catalogue/objets', function() {
        \app\controllers\CatalogueController::getObjects();
    });

    // Route pour récupérer les compteurs de catégories
    $router->get('/api/catalogue/categories-count', function() {
        \app\controllers\CatalogueController::getCategoriesCount();
    });

    // Route pour récupérer les catégories
    $router->get('/api/catalogue/categories', function() {
        \app\controllers\CatalogueController::getCategories();
    });
    
  
    // Route API pour l'historique d'un objet (JSON)
    $router->get('/api/objet/@id/historique', function($id) {
        \app\controllers\ObjetController::getHistorique($id);
    });

    // Page messages
    $router->get('/messages', function() {
        MessageController::index();
        exit();
    });

    // Page profil
    $router->get('/profile', function() {
        UserController::profile();
        exit();
    });

    // API profil
    $router->post('/api/profile', function() {
        UserController::updateProfile();
        exit();
    });

    // API messages
    $router->group('/api/messages', function (Router $router) {
        $router->get('/conversations', function() {
            MessageController::getConversations();
        });

        $router->get('/users', function() {
            MessageController::getUsers();
        });

        $router->get('/unread-count', function() {
            MessageController::unreadCount();
        });

        $router->get('/conversation/@userId:[0-9]+', function($userId) {
            MessageController::getConversation($userId);
        });

        $router->put('/conversation/@userId:[0-9]+/read', function($userId) {
            MessageController::markAsRead($userId);
        });

        $router->post('/send', function() {
            MessageController::send();
        });
    });
    
}, [SecurityHeadersMiddleware::class]);
