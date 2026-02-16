<?php

use flight\net\Router;
use flight\Engine;
use app\controllers\UserController;
use app\middlewares\SecurityHeadersMiddleware;

/**
 * Routes d'authentification
 * Groupe: /auth et /api/auth
 */
$router->group('', function (Router $router) use ($app) {
    // Page de login
    $router->get('/', function() use ($app) {
        $app->render('index');
        exit();
    });
    
}, [SecurityHeadersMiddleware::class]);
// Groupe des pages d'authentification (vues HTML)
// $router->group('/auth', function (Router $router) use ($app) {
    
//     // Page de connexion/inscription
//     $router->get('/login', function() use ($app) {
//         // Si déjà connecté, rediriger
//         if (isset($_SESSION['user_id'])) {
//             $app->redirect('/');
//             return;
//         }
//         $app->render('/api/auth/login');
//         exit();
//     });
    
//     // Page de réinitialisation de mot de passe (optionnel)
//     // $router->get('/forgot-password', function() use ($app) {
//     //     $app->render('auth/forgot-password');
//     // });
    
// }, [SecurityHeadersMiddleware::class]);

// Groupe des API d'authentification (JSON)
$router->group('/api/auth', function (Router $router) use ($app) {

    //inscription
    $router->post('/register', function() {
    UserController::register();
    exit();
    });

    // Connexion
    $router->post('/login', function() {
        UserController::login();
        exit();
    });

    // Déconnexion
    $router->post('/logout', function() {
        UserController::logout();
        exit();
    });

// Obtenir l'utilisateur connecté
// $router->get('/me', function() {
//     UserController::getCurrentUser();
//     exit();
// });

// Vérifier si un email existe
$router->get('/check-email', function() use ($app) {
    header('Content-Type: application/json');
    
    $email = $app->request()->query['email'] ?? '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email requis'
        ]);
        exit();
    }
    
    $exists = \app\models\UserModel::emailExists($email);
    
    echo json_encode([
        'success' => true,
        'exists' => $exists
    ]);
    exit();
});
    
}, [SecurityHeadersMiddleware::class]);

// require_once __DIR__ . '/auth_route.php';
// $router->group('', function (Router $router) use ($app) {
//     // Dashboard
//     $router->get('/accueil', function() use ($app) {
//         $app->render('accueil');
//         exit();
//     });
    
// }, [SecurityHeadersMiddleware::class]);