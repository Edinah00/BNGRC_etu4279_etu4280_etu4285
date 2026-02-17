<?php
use app\controllers\RapportController;

Flight::route('GET /rapport', function() {
    $controller = new RapportController();
    $controller->page();
});

Flight::route('GET /api/rapport', function() {
    $controller = new RapportController();
    $controller->index();
});

Flight::route('GET /api/rapport/summary', function() {
    $controller = new RapportController();
    $controller->getSummary();
});

Flight::route('GET /api/rapport/by-type', function() {
    $controller = new RapportController();
    $controller->getByType();
});

Flight::route('GET /api/rapport/by-region', function() {
    $controller = new RapportController();
    $controller->getByRegion();
});

Flight::route('GET /api/rapport/by-city', function() {
    $controller = new RapportController();
    $controller->getByCity();
});

Flight::route('GET /api/rapport/timeline', function() {
    $controller = new RapportController();
    $controller->getTimeline();
});

Flight::route('GET /api/rapport/export/pdf', function() {
    $controller = new RapportController();
    $controller->exportPdf();
});
?>