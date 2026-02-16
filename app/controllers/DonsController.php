<?php

declare(strict_types=1);

class DonsController
{
    public function index(): void
    {
        Flight::render('dons');
    }

    public function apiList(): void
    {
        $model = new DonsModel(Flight::db());
        Flight::json([
            'success' => true,
            'data' => [
                'dons' => $model->list(),
                'types' => $model->types(),
            ],
        ]);
    }

    public function apiCreate(): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $typeId = (int) ($payload['type_id'] ?? 0);
        $quantite = (float) ($payload['quantite'] ?? 0);
        $dateDon = (string) ($payload['date_don'] ?? '');

        if ($typeId <= 0 || $quantite <= 0 || $dateDon === '') {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new DonsModel(Flight::db());
        $id = $model->create($typeId, $quantite, $dateDon);
        Flight::json(['success' => true, 'id' => $id]);
    }

    public function apiUpdate(int $id): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $typeId = (int) ($payload['type_id'] ?? 0);
        $quantite = (float) ($payload['quantite'] ?? 0);
        $dateDon = (string) ($payload['date_don'] ?? '');

        if ($typeId <= 0 || $quantite <= 0 || $dateDon === '') {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new DonsModel(Flight::db());
        $model->update($id, $typeId, $quantite, $dateDon);
        Flight::json(['success' => true]);
    }

    public function apiDelete(int $id): void
    {
        $model = new DonsModel(Flight::db());
        $model->delete($id);
        Flight::json(['success' => true]);
    }
}
