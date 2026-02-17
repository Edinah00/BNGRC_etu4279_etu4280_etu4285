<?php

use app\controllers\AchatsController;
use app\controllers\BesoinsController;
use app\controllers\DonsController;
use app\controllers\RegionsController;
use app\controllers\VillesController;
use flight\Engine;


// Pages
$router->get('/regions', fn() => $app->render('model', ['page' => 'regions']));
$router->get('/villes',  fn() => $app->render('model', ['page' => 'villes']));
$router->get('/besoins', fn() => $app->render('model', ['page' => 'besoins']));
$router->get('/dons',    fn() => $app->render('model', ['page' => 'dons']));
$router->get('/achats',  fn() => $app->render('model', ['page' => 'achats']));

// API Regions
$router->get('/api/regions',                   [new RegionsController(), 'listItems']);
$router->post('/api/regions',                  [new RegionsController(), 'create']);
$router->put('/api/regions/@id:[0-9]+',        [new RegionsController(), 'update']);
$router->delete('/api/regions/@id:[0-9]+',     [new RegionsController(), 'delete']);

// API Villes
$router->get('/api/villes',                    [new VillesController(), 'listItems']);
$router->post('/api/villes',                   [new VillesController(), 'create']);
$router->put('/api/villes/@id:[0-9]+',         [new VillesController(), 'update']);
$router->delete('/api/villes/@id:[0-9]+',      [new VillesController(), 'delete']);

// API Besoins
$router->get('/api/besoins',                   [new BesoinsController(), 'listItems']);
$router->post('/api/besoins',                  [new BesoinsController(), 'create']);
$router->put('/api/besoins/@id:[0-9]+',        [new BesoinsController(), 'update']);
$router->delete('/api/besoins/@id:[0-9]+',     [new BesoinsController(), 'delete']);

// API Dons
$router->get('/api/dons',                      [new DonsController(), 'listItems']);
$router->post('/api/dons',                     [new DonsController(), 'create']);
$router->put('/api/dons/@id:[0-9]+',           [new DonsController(), 'update']);
$router->delete('/api/dons/@id:[0-9]+',        [new DonsController(), 'delete']);

// API Achats
$router->get('/api/achats',                    [new AchatsController(), 'listItems']);
$router->post('/api/achats',                   [new AchatsController(), 'create']);
$router->post('/api/achats/type',              [new AchatsController(), 'createByType']);
$router->put('/api/achats/configuration/frais',[new AchatsController(), 'updateFeeRate']);