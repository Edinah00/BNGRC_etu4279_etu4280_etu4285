<?php

use flight\net\Router;
use app\controllers\AdminController;
use app\middlewares\SecurityHeadersMiddleware;

// Routes d'administration
$router->group('/admin', function (Router $router) {
    
    // Page de login admin
    $router->get('/login', function() {
        Flight::render('index', ['activeTab' => 'admin']);
        exit();
    });
    
    // Connexion admin (POST - API JSON)
    $router->post('/login', function() {
        AdminController::login();
        exit();
    });
    
    // Dashboard admin
    $router->get('/dashboard', function() {
        AdminController::dashboard();
        exit();
    });
    
    // Déconnexion admin
    $router->get('/logout', function() {
        AdminController::logout();
        exit();
    });
    
}, [SecurityHeadersMiddleware::class]);

// API Admin
$router->group('/api/admin', function (Router $router) {
    
    // Statistiques
    $router->get('/stats', function() {
        AdminController::getStats();
        exit();
    });
    
    // Catégories
    $router->get('/categories', function() {
        AdminController::getCategories();
        exit();
    });
    
    $router->post('/categories', function() {
        AdminController::createCategorie();
        exit();
    });
    
    $router->put('/categories/@id', function($id) {
        AdminController::updateCategorie($id);
        exit();
    });
    
    $router->delete('/categories/@id', function($id) {
        AdminController::deleteCategorie($id);
        exit();
    });
    
}, [SecurityHeadersMiddleware::class]);