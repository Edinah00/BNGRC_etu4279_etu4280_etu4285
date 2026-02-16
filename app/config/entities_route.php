<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/RegionsModel.php';
require_once __DIR__ . '/../models/VillesModel.php';
require_once __DIR__ . '/../models/BesoinsModel.php';
require_once __DIR__ . '/../models/DonsModel.php';

require_once __DIR__ . '/../controllers/RegionsController.php';
require_once __DIR__ . '/../controllers/VillesController.php';
require_once __DIR__ . '/../controllers/BesoinsController.php';
require_once __DIR__ . '/../controllers/DonsController.php';

$router->get('/regions', [new RegionsController(), 'index']);
$router->get('/villes', [new VillesController(), 'index']);
$router->get('/besoins', [new BesoinsController(), 'index']);
$router->get('/dons', [new DonsController(), 'index']);

$router->get('/api/regions', [new RegionsController(), 'apiList']);
$router->post('/api/regions', [new RegionsController(), 'apiCreate']);
$router->put('/api/regions/@id:[0-9]+', [new RegionsController(), 'apiUpdate']);
$router->delete('/api/regions/@id:[0-9]+', [new RegionsController(), 'apiDelete']);

$router->get('/api/villes', [new VillesController(), 'apiList']);
$router->post('/api/villes', [new VillesController(), 'apiCreate']);
$router->put('/api/villes/@id:[0-9]+', [new VillesController(), 'apiUpdate']);
$router->delete('/api/villes/@id:[0-9]+', [new VillesController(), 'apiDelete']);

$router->get('/api/besoins', [new BesoinsController(), 'apiList']);
$router->post('/api/besoins', [new BesoinsController(), 'apiCreate']);
$router->put('/api/besoins/@id:[0-9]+', [new BesoinsController(), 'apiUpdate']);
$router->delete('/api/besoins/@id:[0-9]+', [new BesoinsController(), 'apiDelete']);

$router->get('/api/dons', [new DonsController(), 'apiList']);
$router->post('/api/dons', [new DonsController(), 'apiCreate']);
$router->put('/api/dons/@id:[0-9]+', [new DonsController(), 'apiUpdate']);
$router->delete('/api/dons/@id:[0-9]+', [new DonsController(), 'apiDelete']);

