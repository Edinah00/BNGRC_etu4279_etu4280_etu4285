<?php

declare(strict_types=1);

class DashboardController
{
    public function index(): void
    {
        Flight::render('dashboard');
    }

    public function apiData(): void
    {
        try {
            $dashboardModel = new DashboardModel(Flight::db());
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
