<?php
namespace app\models;

use Flight;
use PDO;

class BesoinsModel
{
    public function getAll($villeId = null, $typeId = null)
    {
        $sql = "SELECT b.id_besoin AS id, b.id_ville, v.nom AS ville, b.id_type,
                       t.libelle AS type, t.categorie, b.nom_produit, b.quantite, b.prix_unitaire, b.date_saisie
                FROM besoin b
                LEFT JOIN ville v ON v.id_ville = b.id_ville
                LEFT JOIN type_besoin t ON t.id_type = b.id_type
                WHERE 1=1";
        $params = [];

        if ($villeId !== null) {
            $sql .= " AND b.id_ville = ?";
            $params[] = $villeId;
        }

        if ($typeId !== null) {
            $sql .= " AND b.id_type = ?";
            $params[] = $typeId;
        }

        $sql .= " ORDER BY b.date_saisie DESC, b.id_besoin DESC";

        $stmt = Flight::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM besoin WHERE id_besoin = ?";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getVilles()
    {
        $sql = "SELECT id_ville AS id, nom FROM ville ORDER BY nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTypes()
    {
        $sql = "SELECT id_type AS id, libelle, categorie FROM type_besoin ORDER BY libelle ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($villeId, $typeId, $nomProduit, $quantite, $prixUnitaire)
    {
        $sql = "INSERT INTO besoin (id_ville, id_type, nom_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?, ?)";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$villeId, $typeId, $nomProduit, $quantite, $prixUnitaire]);
    }

    public function update($id, $villeId, $typeId, $nomProduit, $quantite, $prixUnitaire)
    {
        $sql = "UPDATE besoin SET id_ville = ?, id_type = ?, nom_produit = ?, quantite = ?, prix_unitaire = ? WHERE id_besoin = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$villeId, $typeId, $nomProduit, $quantite, $prixUnitaire, $id]);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM besoin WHERE id_besoin = ?";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>