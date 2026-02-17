<?php

namespace app\controllers;

use app\models\AchatsModel;
use Flight;

class AchatsController{
    public function index(){
        Flight::render('achats');
    }

    public function listItems(){
        try {
            $model = new AchatsModel();

            $villeId = isset($_GET['ville_id']) ? (int) $_GET['ville_id'] : null;
            $typeId = isset($_GET['type_id']) ? (int) $_GET['type_id'] : null;
            $periode = (string) ($_GET['periode'] ?? 'all');

            $context = $model->getContext(
                ($villeId ?? 0) > 0 ? $villeId : null,
                ($typeId ?? 0) > 0 ? $typeId : null,
                $periode
            );

            Flight::json([
                'success' => true,
                'data' => $context,
            ]);
        } catch (\Throwable $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des achats: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function create(){
        $payload = $this->payload();
        $idBesoin = (int) ($payload['id_besoin'] ?? 0);
        $quantite = (float) ($payload['quantite'] ?? 0);

        if ($idBesoin <= 0 || $quantite <= 0) {
            Flight::json([
                'success' => false,
                'message' => ' Champs invalides. Vérifiez le besoin et la quantité.',
            ], 422);
            return;
        }

        try {
            $model = new AchatsModel();
            $result = $model->createAchat($idBesoin, $quantite);

            Flight::json([
                'success' => true,
                'message' => ' Achat effectué avec succès.',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur serveur pendant la création de l\'achat: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateFeeRate(){
        $payload = $this->payload();
        $rate = (float) ($payload['taux_frais'] ?? -1);

        try {
            $model = new AchatsModel();
            $model->updateFeeRate($rate);

            Flight::json([
                'success' => true,
                'message' => 'Taux de frais mis à jour.',
                'data' => [
                    'taux_frais' => $model->getFeeRate(),
                ],
            ]);
        } catch (\Exception $e) {
            Flight::json([
                'success' => false,
                'message' => '' . $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Flight::json([
                'success' => false,
                'message' => 'Erreur serveur pendant la mise à jour: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function payload(){
        $requestData = Flight::request()->data->getData();
        if (is_array($requestData) && !empty($requestData)) {
            return $requestData;
        }
        return $_POST;
    }
}
