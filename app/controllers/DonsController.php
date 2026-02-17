<?php

namespace app\controllers;

use app\models\DonsModel;
use Flight;

class DonsController
{
    public function index(): void
    {
        Flight::render('dons');
    }

    public function listItems(): void
    {
        $model = new DonsModel();
        Flight::json([
            'success' => true,
            'data' => [
                'dons' => $model->getAll(),
                'types' => $model->getTypes(),
            ],
        ]);
    }

    public function create(): void
    {
        $payload = $this->payload();
        $typeId = (int) ($payload['type_id'] ?? 0);
        $quantite = (float) ($payload['quantite'] ?? 0);
        $dateDon = (string) ($payload['date_don'] ?? '');

        if ($typeId <= 0 || $quantite <= 0 || $dateDon === '') {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new DonsModel();
        $model->create($typeId, $quantite, $dateDon);
        Flight::json(['success' => true]);
    }

    public function update(int $id): void
    {
        $payload = $this->payload();
        $typeId = (int) ($payload['type_id'] ?? 0);
        $quantite = (float) ($payload['quantite'] ?? 0);
        $dateDon = (string) ($payload['date_don'] ?? '');

        if ($typeId <= 0 || $quantite <= 0 || $dateDon === '') {
            Flight::json(['success' => false, 'message' => 'Champs invalides'], 422);
            return;
        }

        $model = new DonsModel();
        $model->update($id, $typeId, $quantite, $dateDon);
        Flight::json(['success' => true]);
    }

    public function delete(int $id): void
    {
        $model = new DonsModel();
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
