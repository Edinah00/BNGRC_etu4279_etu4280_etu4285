<?php

namespace app\controllers;

use app\models\VillesModel;
use Flight;

class VillesController
{
    public function index(){
        Flight::render('villes');
    }

    public function listItems(){
        $model = new VillesModel();
        Flight::json([
            'success' => true,
            'data' => [
                'villes' => $model->getAll(),
                'regions' => $model->getRegions(),
            ],
        ]);
    }

    public function create(){
        $payload = $this->payload();
        $nom = trim((string) ($payload['nom'] ?? ''));
        $regionId = (int) ($payload['region_id'] ?? 0);
        if ($nom === '' || $regionId <= 0) {
            Flight::json(['success' => false, 'message' => 'Nom et region requis'], 422);
            return;
        }

        $model = new VillesModel();
        $model->create($nom, $regionId);
        Flight::json(['success' => true]);
    }

    public function update(int $id){
        $payload = $this->payload();
        $nom = trim((string) ($payload['nom'] ?? ''));
        $regionId = (int) ($payload['region_id'] ?? 0);
        if ($nom === '' || $regionId <= 0) {
            Flight::json(['success' => false, 'message' => 'Nom et region requis'], 422);
            return;
        }

        $model = new VillesModel();
        $model->update($id, $nom, $regionId);
        Flight::json(['success' => true]);
    }

    public function delete(int $id){
        $model = new VillesModel();
        $model->delete($id);
        Flight::json(['success' => true]);
    }

    private function payload(){
        $requestData = Flight::request()->data->getData();
        if (is_array($requestData) && !empty($requestData)) {
            return $requestData;
        }
        return $_POST;
    }
}
