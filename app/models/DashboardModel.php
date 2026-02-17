<?php
namespace app\models;

use Flight;
use PDO;

class DashboardModel
{
    public function getStats()
    {
        $sql = "SELECT
            (SELECT COUNT(*) FROM region) AS regions,
            (SELECT COUNT(*) FROM ville) AS villes,
            (SELECT COUNT(*) FROM besoin) AS besoins,
            (SELECT COUNT(*) FROM don) AS dons,
            (SELECT COUNT(*) FROM distribution) AS distributions,
            (SELECT COALESCE(SUM(quantite), 0) FROM don) AS dons_quantite,
            (
                SELECT COALESCE(SUM(d.quantite * COALESCE(p.prix_moyen, 0)), 0)
                FROM don d
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
            ) AS valeur_dons_estimee";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getBesoinsByRegion()
    {
        $sql = "SELECT r.nom AS region, COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS total_besoins
                FROM region r
                LEFT JOIN ville v ON v.id_region = r.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                GROUP BY r.id_region, r.nom
                ORDER BY total_besoins DESC, r.nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBesoinsByType()
    {
        $sql = "SELECT t.libelle AS type, COUNT(b.id_besoin) AS total
                FROM type_besoin t
                LEFT JOIN besoin b ON b.id_type = t.id_type
                GROUP BY t.id_type, t.libelle
                HAVING COUNT(b.id_besoin) > 0
                ORDER BY total DESC, t.libelle ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTopCities()
    {
        $sql = "SELECT v.nom AS ville, r.nom AS region,
                       COUNT(b.id_besoin) AS besoins_count,
                       COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS total_value
                FROM ville v
                LEFT JOIN region r ON r.id_region = v.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                GROUP BY v.id_ville, v.nom, r.nom
                ORDER BY total_value DESC, v.nom ASC
                LIMIT 10";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDashboardData()
    {
        return [
            'stats' => $this->getStats(),
            'bar' => $this->getBesoinsByRegion(),
            'pie' => $this->getBesoinsByType(),
            'table' => $this->getTopCities(),
        ];
    }
}
?>