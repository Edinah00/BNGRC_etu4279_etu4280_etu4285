<?php

declare(strict_types=1);

class RegionsController
{
    public function index(): void
    {
        Flight::render('regions');
    }

    public function apiList(): void
    {
        $model = new RegionsModel(Flight::db());
        Flight::json(['success' => true, 'data' => $model->list()]);
    }

    public function apiCreate(): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $nom = trim((string) ($payload['nom'] ?? ''));
        if ($nom === '') {
            Flight::json(['success' => false, 'message' => 'Nom requis'], 422);
            return;
        }

        $model = new RegionsModel(Flight::db());
        $id = $model->create($nom);
        Flight::json(['success' => true, 'id' => $id]);
    }

    public function apiUpdate(int $id): void
    {
        $payload = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
        $nom = trim((string) ($payload['nom'] ?? ''));
        if ($nom === '') {
            Flight::json(['success' => false, 'message' => 'Nom requis'], 422);
            return;
        }

        $model = new RegionsModel(Flight::db());
        $model->update($id, $nom);
        Flight::json(['success' => true]);
    }

    public function apiDelete(int $id): void
    {
        $model = new RegionsModel(Flight::db());
        $model->delete($id);
        Flight::json(['success' => true]);
    }
}
