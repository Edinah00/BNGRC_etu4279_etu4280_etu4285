<?php

declare(strict_types=1);

class BesoinsController
{
    public function index(): void
    {
        Flight::render('besoins');
    }

    public function apiList(): void
    {
        $model = new BesoinsModel(Flight::db());
        $villeId = isset($_GET['ville_id']) ? (int) $_GET['ville_id'] : null;
        $typeId = isset($_GET['type_id']) ? (int) $_GET['type_id'] : null;

        Flight::json([
            'success' => true,
            'data' => [
                'besoins' => $model->list($villeId ?: null, $typeId ?: null),
                'villes' => $model->villes(),
                'types' => $model->types(),
            ],
        ]);
    }

    public function apiCreate(): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $villeId = (int) ($payload['ville_id'] ?? 0);
        $typeId = (int) ($payload['type_id'] ?? 0);
        $description = trim((string) ($payload['description'] ?? ''));
        $quantite = (float) ($payload['quantite'] ?? 0);
        $prixUnitaire = (float) ($payload['prix_unitaire'] ?? 0);

        if ($villeId <= 0 || $typeId <= 0 || $description === '' || $quantite <= 0 || $prixUnitaire < 0) {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new BesoinsModel(Flight::db());
        $id = $model->create($villeId, $typeId, $description, $quantite, $prixUnitaire);
        Flight::json(['success' => true, 'id' => $id]);
    }

    public function apiUpdate(int $id): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $villeId = (int) ($payload['ville_id'] ?? 0);
        $typeId = (int) ($payload['type_id'] ?? 0);
        $description = trim((string) ($payload['description'] ?? ''));
        $quantite = (float) ($payload['quantite'] ?? 0);
        $prixUnitaire = (float) ($payload['prix_unitaire'] ?? 0);

        if ($villeId <= 0 || $typeId <= 0 || $description === '' || $quantite <= 0 || $prixUnitaire < 0) {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new BesoinsModel(Flight::db());
        $model->update($id, $villeId, $typeId, $description, $quantite, $prixUnitaire);
        Flight::json(['success' => true]);
    }

    public function apiDelete(int $id): void
    {
        $model = new BesoinsModel(Flight::db());
        $model->delete($id);
        Flight::json(['success' => true]);
    }
}
