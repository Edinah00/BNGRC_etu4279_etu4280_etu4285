<?php

declare(strict_types=1);

namespace app\controllers;

use Flight;
use app\models\RapportModel;
use Throwable;

/**
 * Contrôleur Rapport
 * Gère les requêtes pour les statistiques et analyses détaillées
 */
class RapportController
{
    /**
     * Affiche toutes les statistiques du rapport
     * 
     * @return void
     */
    public static function index(): void
    {
        try {
            $model = new RapportModel();
            $data = $model->getAllStats();

            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::index: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient le résumé/synthèse
     * 
     * @return void
     */
    public static function getSummary(): void
    {
        try {
            $model = new RapportModel();
            $summary = $model->getSummary();
            $globalStats = $model->getGlobalStats();

            Flight::json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'global_stats' => $globalStats
                ]
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::getSummary: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement du résumé.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient la comparaison par type
     * 
     * @return void
     */
    public static function getByType(): void
    {
        try {
            $model = new RapportModel();
            $data = $model->getByType();

            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::getByType: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par type.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient les besoins par région
     * 
     * @return void
     */
    public static function getByRegion(): void
    {
        try {
            $model = new RapportModel();
            $data = $model->getByRegion();

            Flight::json([
                'success' => true,
                'data' => $data
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::getByRegion: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par région.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient les statistiques détaillées par ville
     * 
     * @return void
     */
    public static function getByCity(): void
    {
        try {
            $request = Flight::request();
            $limit = (int) ($request->query->limit ?? 20);
            
            // Validation de la limite
            if ($limit < 0) {
                $limit = 0; // 0 = tous les résultats
            } elseif ($limit > 100) {
                $limit = 100; // Maximum 100 résultats
            }

            $model = new RapportModel();
            $data = $model->getByCity($limit);

            Flight::json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'limit' => $limit,
                    'count' => count($data)
                ]
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::getByCity: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des données par ville.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient l'évolution temporelle
     * 
     * @return void
     */
    public static function getTimeline(): void
    {
        try {
            $request = Flight::request();
            $days = (int) ($request->query->days ?? 30);
            
            // Validation du nombre de jours
            if ($days < 1) {
                $days = 30;
            } elseif ($days > 365) {
                $days = 365;
            }

            $model = new RapportModel();
            $data = $model->getTimeline($days);

            Flight::json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'days' => $days
                ]
            ]);
        } catch (Throwable $e) {
            error_log("Erreur RapportController::getTimeline: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'évolution temporelle.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exporte le rapport en PDF (fonctionnalité optionnelle)
     * 
     * @return void
     */
    public static function exportPdf(): void
    {
        try {
            // Cette fonctionnalité nécessite une bibliothèque PDF comme TCPDF ou mPDF
            // Pour l'instant, on retourne un message indiquant que c'est en développement
            
            Flight::json([
                'success' => false,
                'message' => 'La fonctionnalité d\'export PDF est en cours de développement.',
                'data' => null
            ], 501);
            
            // Exemple d'implémentation future avec mPDF:
            /*
            $model = new RapportModel();
            $data = $model->getAllStats();
            
            require_once __DIR__ . '/../../vendor/autoload.php';
            $mpdf = new \Mpdf\Mpdf();
            
            // Générer le contenu HTML du PDF
            $html = self::generatePdfHtml($data);
            
            $mpdf->WriteHTML($html);
            $mpdf->Output('rapport_bngrc_' . date('Y-m-d') . '.pdf', 'D');
            */
        } catch (Throwable $e) {
            error_log("Erreur RapportController::exportPdf: " . $e->getMessage());
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors de l\'export PDF.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Génère le contenu HTML pour le PDF (méthode privée helper)
     * 
     * @param array $data
     * @return string
     */
    private static function generatePdfHtml(array $data): string
    {
        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rapport BNGRC</title>';
        $html .= '<style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #0C2B4E; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0C2B4E; color: white; }
        </style></head><body>';
        
        $html .= '<h1>Rapport BNGRC - ' . date('d/m/Y') . '</h1>';
        
        // Ajouter les sections du rapport
        if (!empty($data['summary'])) {
            $html .= '<h2>Résumé</h2>';
            $html .= '<table>';
            $html .= '<tr><th>Indicateur</th><th>Valeur (Ar)</th></tr>';
            $html .= '<tr><td>Besoins totaux</td><td>' . number_format($data['summary']['besoins_totaux'], 2) . '</td></tr>';
            $html .= '<tr><td>Dons reçus</td><td>' . number_format($data['summary']['dons_recus'], 2) . '</td></tr>';
            $html .= '<tr><td>Distribués</td><td>' . number_format($data['summary']['distribues'], 2) . '</td></tr>';
            $html .= '<tr><td>Restants</td><td>' . number_format($data['summary']['restants'], 2) . '</td></tr>';
            $html .= '</table>';
        }
        
        $html .= '</body></html>';
        
        return $html;
    }
}
