<?php
namespace app\controllers;

use Flight;
use app\models\RapportModel;

class RapportController
{
    public function page()
    {
        Flight::render('rapport');
    }

    public function index()
    {
        try {
            $rapportModel = new RapportModel();
            $data = $rapportModel->getAllStats();
            
            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSummary()
    {
        try {
            $rapportModel = new RapportModel();
            $summary = $rapportModel->getSummary();
            $globalStats = $rapportModel->getGlobalStats();
            
            Flight::json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'global_stats' => $globalStats
                ]
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement du résumé.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByType()
    {
        try {
            $rapportModel = new RapportModel();
            $data = $rapportModel->getByType();
            
            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByRegion()
    {
        try {
            $rapportModel = new RapportModel();
            $data = $rapportModel->getByRegion();
            
            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par région.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByCity()
    {
        try {
            $request = Flight::request();
            $limit = isset($request->query->limit) ? (int) $request->query->limit : 20;
            
            if ($limit < 0) {
                $limit = 0;
            } elseif ($limit > 100) {
                $limit = 100;
            }
            
            $rapportModel = new RapportModel();
            $data = $rapportModel->getByCity($limit);
            
            Flight::json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'limit' => $limit,
                    'count' => count($data)
                ]
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par ville.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTimeline()
    {
        try {
            $request = Flight::request();
            $days = isset($request->query->days) ? (int) $request->query->days : 30;
            
            if ($days < 1) {
                $days = 30;
            } elseif ($days > 365) {
                $days = 365;
            }
            
            $rapportModel = new RapportModel();
            $data = $rapportModel->getTimeline($days);
            
            Flight::json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'days' => $days
                ]
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'évolution temporelle.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportPdf()
    {
        Flight::json([
            'success' => false,
            'message' => 'La fonctionnalité d\'export PDF est en cours de développement.',
            'data' => null
        ], 501);
    }
}
?>