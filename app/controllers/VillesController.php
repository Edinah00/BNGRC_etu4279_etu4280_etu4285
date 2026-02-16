<?php

declare(strict_types=1);

class VillesController
{
    public function index(): void
    {
        Flight::render('villes');
    }

    public function apiList(): void
    {
        $model = new VillesModel(Flight::db());
        Flight::json([
            'success' => true,
            'data' => [
                'villes' => $model->list(),
                'regions' => $model->regions(),
            ],
        ]);
    }

    public function apiCreate(): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $nom = trim((string) ($payload['nom'] ?? ''));
        $regionId = (int) ($payload['region_id'] ?? 0);
        if ($nom === '' || $regionId <= 0) {
            Flight::json(['success' => false, 'message' => 'Nom et region requis'], 422);
            return;
        }

        $model = new VillesModel(Flight::db());
        $id = $model->create($nom, $regionId);
        Flight::json(['success' => true, 'id' => $id]);
    }

    public function apiUpdate(int $id): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $nom = trim((string) ($payload['nom'] ?? ''));
        $regionId = (int) ($payload['region_id'] ?? 0);
        if ($nom === '' || $regionId <= 0) {
            Flight::json(['success' => false, 'message' => 'Nom et region requis'], 422);
            return;
        }

        $model = new VillesModel(Flight::db());
        $model->update($id, $nom, $regionId);
        Flight::json(['success' => true]);
    }

    public function apiDelete(int $id): void
    {
        $model = new VillesModel(Flight::db());
        $model->delete($id);
        Flight::json(['success' => true]);
    }
}
