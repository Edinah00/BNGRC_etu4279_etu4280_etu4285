<?php

declare(strict_types=1);

class DashboardController
{
    /** @var DashboardModel */
    private $dashboardModel;

    public function __construct(DashboardModel $dashboardModel)
    {
        $this->dashboardModel = $dashboardModel;
    }

    public function index(): void
    {
        Flight::render('dashboard');
    }

    public function apiData(): void
    {
        try {
            $data = $this->dashboardModel->getDashboardData();

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
