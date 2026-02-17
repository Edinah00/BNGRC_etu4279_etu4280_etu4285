<?php

namespace app\controllers;

use app\models\BesoinsModel;
use Flight;

class BesoinsController
{
    public function index(): void
    {
        Flight::render('besoins');
    }

    public function listItems(): void
    {
        $model = new BesoinsModel();
        $villeId = isset($_GET['ville_id']) ? (int) $_GET['ville_id'] : null;
        $typeId = isset($_GET['type_id']) ? (int) $_GET['type_id'] : null;

        Flight::json([
            'success' => true,
            'data' => [
                'besoins' => $model->getAll($villeId ?: null, $typeId ?: null),
                'villes' => $model->getVilles(),
                'types' => $model->getTypes(),
            ],
        ]);
    }

    public function create(): void
    {
        $payload = $this->payload();
        $villeId = (int) ($payload['ville_id'] ?? 0);
        $typeId = (int) ($payload['type_id'] ?? 0);
        $description = trim((string) ($payload['description'] ?? ''));
        $quantite = (float) ($payload['quantite'] ?? 0);
        $prixUnitaire = (float) ($payload['prix_unitaire'] ?? 0);

        if ($villeId <= 0 || $typeId <= 0 || $description === '' || $quantite <= 0 || $prixUnitaire < 0) {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new BesoinsModel();
        $model->create($villeId, $typeId, $description, $quantite, $prixUnitaire);
        Flight::json(['success' => true]);
    }

    public function update(int $id): void
    {
        $payload = $this->payload();
        $villeId = (int) ($payload['ville_id'] ?? 0);
        $typeId = (int) ($payload['type_id'] ?? 0);
        $description = trim((string) ($payload['description'] ?? ''));
        $quantite = (float) ($payload['quantite'] ?? 0);
        $prixUnitaire = (float) ($payload['prix_unitaire'] ?? 0);

        if ($villeId <= 0 || $typeId <= 0 || $description === '' || $quantite <= 0 || $prixUnitaire < 0) {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new BesoinsModel();
        $model->update($id, $villeId, $typeId, $description, $quantite, $prixUnitaire);
        Flight::json(['success' => true]);
    }

    public function delete(int $id): void
    {
        $model = new BesoinsModel();
        $model->delete($id);
        Flight::json(['success' => true]);
    }

    private function payload(): array
    {
        $requestData = Flight::request()->data->getData();
        if (is_array($requestData) && !empty($requestData)) {
            return $requestData;
        }
        return $_POST;
    }
}
