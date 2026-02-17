<?php
namespace app\models;

use Flight;
use PDO;

class RegionsModel
{
    public function getAll()
    {
        $sql = "SELECT r.id_region AS id, r.nom, COUNT(v.id_ville) AS nb_villes
                FROM region r
                LEFT JOIN ville v ON v.id_region = r.id_region
                GROUP BY r.id_region, r.nom
                ORDER BY r.nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($nom)
    {
        $sql = "INSERT INTO region (nom) VALUES (?)";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$nom]);
    }

    public function update($id, $nom)
    {
        $sql = "UPDATE region SET nom = ? WHERE id_region = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$nom, $id]);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM region WHERE id_region = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>