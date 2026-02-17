<?php

namespace app\controllers;

use app\models\RegionsModel;
use Flight;

class RegionsController{
    public function index(){
        Flight::render('regions');
    }

    public function listItems(){
        $model = new RegionsModel();
        Flight::json(['success' => true, 'data' => $model->getAll()]);
    }

    public function create(){
        $payload = $this->payload();
        $nom = trim((string) ($payload['nom'] ?? ''));
        if ($nom === '') {
            Flight::json(['success' => false, 'message' => 'Nom requis'], 422);
            return;
        }

        $model = new RegionsModel();
        $model->create($nom);
        Flight::json(['success' => true]);
    }

    public function update(int $id){
        $payload = $this->payload();
        $nom = trim((string) ($payload['nom'] ?? ''));
        if ($nom === '') {
            Flight::json(['success' => false, 'message' => 'Nom requis'], 422);
            return;
        }

        $model = new RegionsModel();
        $model->update($id, $nom);
        Flight::json(['success' => true]);
    }

    public function delete(int $id){
        $model = new RegionsModel();
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
