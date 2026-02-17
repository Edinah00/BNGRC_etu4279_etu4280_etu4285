<?php

use app\controllers\AchatsController;
use app\controllers\BesoinsController;
use app\controllers\DonsController;
use app\controllers\RegionsController;
use app\controllers\VillesController;

$router->get('/regions', [new RegionsController(), 'index']);
$router->get('/villes', [new VillesController(), 'index']);
$router->get('/besoins', [new BesoinsController(), 'index']);
$router->get('/dons', [new DonsController(), 'index']);
$router->get('/achats', [new AchatsController(), 'index']);

$router->get('/api/regions', [new RegionsController(), 'listItems']);
$router->post('/api/regions', [new RegionsController(), 'create']);
$router->put('/api/regions/@id:[0-9]+', [new RegionsController(), 'update']);
$router->delete('/api/regions/@id:[0-9]+', [new RegionsController(), 'delete']);

$router->get('/api/villes', [new VillesController(), 'listItems']);
$router->post('/api/villes', [new VillesController(), 'create']);
$router->put('/api/villes/@id:[0-9]+', [new VillesController(), 'update']);
$router->delete('/api/villes/@id:[0-9]+', [new VillesController(), 'delete']);

$router->get('/api/besoins', [new BesoinsController(), 'listItems']);
$router->post('/api/besoins', [new BesoinsController(), 'create']);
$router->put('/api/besoins/@id:[0-9]+', [new BesoinsController(), 'update']);
$router->delete('/api/besoins/@id:[0-9]+', [new BesoinsController(), 'delete']);

$router->get('/api/dons', [new DonsController(), 'listItems']);
$router->post('/api/dons', [new DonsController(), 'create']);
$router->put('/api/dons/@id:[0-9]+', [new DonsController(), 'update']);
$router->delete('/api/dons/@id:[0-9]+', [new DonsController(), 'delete']);

$router->get('/api/achats', [new AchatsController(), 'listItems']);
$router->post('/api/achats', [new AchatsController(), 'create']);
$router->put('/api/achats/configuration/frais', [new AchatsController(), 'updateFeeRate']);
