<?php
$routeFiles = [
    'auth_route.php',
    'list_route.php',
    'admin_routes.php',
    'myobjet_routes.php',
    'echange_routes.php',
    'dispatch_routes.php',
];

foreach ($routeFiles as $routeFile) {
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $routeFile;
    if (is_file($fullPath)) {
        require_once $fullPath;
    }
}

require_once __DIR__ . '/dashboard_route.php';
require_once __DIR__ . '/rapport_route.php';
require_once __DIR__ . '/entities_route.php';
