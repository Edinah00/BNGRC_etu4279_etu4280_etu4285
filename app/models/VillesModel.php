<?php
namespace app\models;

use Flight;
use PDO;

class VillesModel
{
    public function getAll()
    {
        $sql = "SELECT v.id_ville AS id, v.nom, v.id_region, r.nom AS region
                FROM ville v
                LEFT JOIN region r ON r.id_region = v.id_region
                ORDER BY v.nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRegions()
    {
        $sql = "SELECT id_region AS id, nom FROM region ORDER BY nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($nom, $idRegion)
    {
        $sql = "INSERT INTO ville (nom, id_region) VALUES (?, ?)";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$nom, $idRegion]);
    }

    public function update($id, $nom, $idRegion)
    {
        $sql = "UPDATE ville SET nom = ?, id_region = ? WHERE id_ville = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$nom, $idRegion, $id]);
    }

    public function delete($id)
    {
        $db = Flight::db();
        $db->beginTransaction();

        try {
            $stmt = $db->prepare("DELETE FROM distribution WHERE id_ville = ?");
            $stmt->execute([$id]);

            $stmt = $db->prepare("DELETE FROM achat WHERE id_ville = ?");
            $stmt->execute([$id]);

            $stmt = $db->prepare("DELETE FROM besoin WHERE id_ville = ?");
            $stmt->execute([$id]);

            $stmt = $db->prepare("DELETE FROM ville WHERE id_ville = ?");
            $stmt->execute([$id]);

            $db->commit();
            return true;
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $e;
        }
    }
}
?>
