<?php

namespace app\controllers;

use app\models\DashboardModel;
use Flight;
use Throwable;

class DashboardController
{
    public function index(): void
    {
        Flight::render('dashboard');
    }

    public function data(): void
    {
        try {
            $dashboardModel = new DashboardModel();
            $data = $dashboardModel->getDashboardData();

            Flight::json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (Throwable $exception) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement du dashboard.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
}
