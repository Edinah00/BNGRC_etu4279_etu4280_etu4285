<?php
namespace app\models;

use Flight;
use PDO;

class DonsModel
{
    public function getAll()
    {
        $sql = "SELECT d.id_don AS id, d.id_type, t.libelle AS type, t.categorie,
                       d.quantite, d.date_don,
                       (d.quantite * COALESCE(p.prix_moyen, 0)) AS valeur_estimee
                FROM don d
                LEFT JOIN type_besoin t ON t.id_type = d.id_type
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
                ORDER BY d.date_don DESC, d.id_don DESC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM don WHERE id_don = ?";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTypes()
    {
        $sql = "SELECT id_type AS id, libelle, categorie FROM type_besoin ORDER BY libelle ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($typeId, $quantite, $dateDon)
    {
        $sql = "INSERT INTO don (id_type, quantite, date_don) VALUES (?, ?, ?)";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$typeId, $quantite, $dateDon]);
    }

    public function update($id, $typeId, $quantite, $dateDon)
    {
        $sql = "UPDATE don SET id_type = ?, quantite = ?, date_don = ? WHERE id_don = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$typeId, $quantite, $dateDon, $id]);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM don WHERE id_don = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>