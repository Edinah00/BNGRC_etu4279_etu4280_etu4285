<?php
namespace app\models;

use Flight;
use PDO;

class RapportModel
{
    public function getSummary()
    {
        $sql = "SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS total FROM besoin";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $totalBesoins = (float) $stmt->fetchColumn();

        $sql = "SELECT COALESCE(SUM(d.quantite * COALESCE(p.prix_moyen, 0)), 0) AS total
                FROM don d
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $totalDons = (float) $stmt->fetchColumn();

        $sql = "SELECT COALESCE(SUM(dist.quantite_attribuee * COALESCE(p.prix_moyen, 0)), 0) AS total
                FROM distribution dist
                INNER JOIN don d ON d.id_don = dist.id_don
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $totalDistribue = (float) $stmt->fetchColumn();

        $restant = max(0, $totalBesoins - $totalDistribue);

        return [
            'besoins_totaux' => $totalBesoins,
            'dons_recus' => $totalDons,
            'distribues' => $totalDistribue,
            'restants' => $restant,
            'taux_satisfaction' => $totalBesoins > 0 ? ($totalDistribue / $totalBesoins) * 100 : 0
        ];
    }

    public function getByType()
    {
        $sql = "SELECT t.libelle AS type,
                       COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS besoins,
                       COALESCE(SUM(d.quantite * b_avg.prix_moyen), 0) AS dons
                FROM type_besoin t
                LEFT JOIN besoin b ON b.id_type = t.id_type
                LEFT JOIN don d ON d.id_type = t.id_type
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) b_avg ON b_avg.id_type = t.id_type
                GROUP BY t.id_type, t.libelle
                ORDER BY besoins DESC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByRegion()
    {
        $sql = "SELECT r.nom AS region,
                       COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS besoins,
                       COUNT(DISTINCT v.id_ville) AS villes_count,
                       COUNT(b.id_besoin) AS besoins_count
                FROM region r
                LEFT JOIN ville v ON v.id_region = r.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                GROUP BY r.id_region, r.nom
                ORDER BY besoins DESC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCity($limit = 20)
    {
        $limit = (int) $limit;
        if ($limit < 0) {
            $limit = 0;
        } elseif ($limit > 1000) {
            $limit = 1000;
        }

        $sql = "SELECT v.nom AS ville, r.nom AS region,
                       COUNT(b.id_besoin) AS besoins_count,
                       COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS besoins_total
                FROM ville v
                LEFT JOIN region r ON r.id_region = v.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                GROUP BY v.id_ville, v.nom, r.nom
                ORDER BY besoins_total DESC
                LIMIT " . $limit;
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTimeline($days = 30)
    {
        $days = (int) $days;
        if ($days < 1) {
            $days = 30;
        } elseif ($days > 3650) {
            $days = 3650;
        }

        $sql = "SELECT DATE(date_don) AS date,
                       COALESCE(SUM(d.quantite * p.prix_moyen), 0) AS dons_valeur,
                       COUNT(d.id_don) AS dons_count
                FROM don d
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
                WHERE date_don >= DATE_SUB(CURDATE(), INTERVAL " . $days . " DAY)
                GROUP BY DATE(date_don)
                ORDER BY date ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $dons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sql = "SELECT DATE(dist.date_dispatch) AS date,
                       COALESCE(SUM(dist.quantite_attribuee * p.prix_moyen), 0) AS distributions_valeur,
                       COUNT(dist.id_dispatch) AS distributions_count
                FROM distribution dist
                INNER JOIN don d ON d.id_don = dist.id_don
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
                WHERE dist.date_dispatch >= DATE_SUB(CURDATE(), INTERVAL " . $days . " DAY)
                GROUP BY DATE(dist.date_dispatch)
                ORDER BY date ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $distributions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'dons' => $dons,
            'distributions' => $distributions
        ];
    }

    public function getAllStats()
    {
        return [
            'summary' => $this->getSummary(),
            'by_type' => $this->getByType(),
            'by_region' => $this->getByRegion(),
            'by_city' => $this->getByCity(10),
            'timeline' => $this->getTimeline(30)
        ];
    }

    public function getGlobalStats()
    {
        $sql = "SELECT
                    (SELECT COUNT(*) FROM region) AS regions,
                    (SELECT COUNT(*) FROM ville) AS villes,
                    (SELECT COUNT(*) FROM besoin) AS besoins,
                    (SELECT COUNT(*) FROM don) AS dons,
                    (SELECT COUNT(*) FROM distribution) AS distributions,
                    (SELECT COUNT(*) FROM type_besoin) AS types";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
