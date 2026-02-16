<?php

declare(strict_types=1);

namespace app\models;

use Flight;
use PDO;
use PDOException;

/**
 * Modèle Rapport
 * Gère les statistiques et analyses détaillées du système BNGRC
 */
class RapportModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Flight::db();
    }

    /**
     * Calcule le résumé global (besoins totaux, dons reçus, distribués, restants)
     * 
     * @return array
     */
    public function getSummary(): array
    {
        try {
            // Calcul des besoins totaux
            $besoinsQuery = "SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS total FROM besoin";
            $besoinsStmt = $this->db->query($besoinsQuery);
            $totalBesoins = (float) $besoinsStmt->fetchColumn();

            // Calcul des dons reçus (basé sur le prix moyen des besoins par type)
            $donsQuery = <<<SQL
                SELECT COALESCE(SUM(d.quantite * COALESCE(p.prix_moyen, 0)), 0) AS total
                FROM don d
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
SQL;
            $donsStmt = $this->db->query($donsQuery);
            $totalDons = (float) $donsStmt->fetchColumn();

            // Calcul des distributions effectuées
            $distributionsQuery = <<<SQL
                SELECT COALESCE(SUM(dist.quantite_attribuee * COALESCE(p.prix_moyen, 0)), 0) AS total
                FROM distribution dist
                INNER JOIN don d ON d.id_don = dist.id_don
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
SQL;
            $distributionsStmt = $this->db->query($distributionsQuery);
            $totalDistribue = (float) $distributionsStmt->fetchColumn();

            // Calcul des besoins restants
            $restant = max(0, $totalBesoins - $totalDistribue);

            return [
                'besoins_totaux' => $totalBesoins,
                'dons_recus' => $totalDons,
                'distribues' => $totalDistribue,
                'restants' => $restant,
                'taux_satisfaction' => $totalBesoins > 0 ? ($totalDistribue / $totalBesoins) * 100 : 0
            ];
        } catch (PDOException $e) {
            error_log("Erreur getSummary: " . $e->getMessage());
            return [
                'besoins_totaux' => 0,
                'dons_recus' => 0,
                'distribues' => 0,
                'restants' => 0,
                'taux_satisfaction' => 0
            ];
        }
    }

    /**
     * Obtient la comparaison besoins/dons par type
     * 
     * @return array
     */
    public function getByType(): array
    {
        try {
            $query = <<<SQL
                SELECT 
                    t.libelle AS type,
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
                ORDER BY besoins DESC
SQL;

            $stmt = $this->db->query($query);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array_map(function($row) {
                return [
                    'type' => (string) ($row['type'] ?? ''),
                    'besoins' => (float) ($row['besoins'] ?? 0),
                    'dons' => (float) ($row['dons'] ?? 0)
                ];
            }, $results);
        } catch (PDOException $e) {
            error_log("Erreur getByType: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtient les besoins par région
     * 
     * @return array
     */
    public function getByRegion(): array
    {
        try {
            $query = <<<SQL
                SELECT 
                    r.nom AS region,
                    COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS besoins,
                    COUNT(DISTINCT v.id_ville) AS villes_count,
                    COUNT(b.id_besoin) AS besoins_count
                FROM region r
                LEFT JOIN ville v ON v.id_region = r.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                GROUP BY r.id_region, r.nom
                ORDER BY besoins DESC
SQL;

            $stmt = $this->db->query($query);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array_map(function($row) {
                return [
                    'region' => (string) ($row['region'] ?? ''),
                    'besoins' => (float) ($row['besoins'] ?? 0),
                    'villes_count' => (int) ($row['villes_count'] ?? 0),
                    'besoins_count' => (int) ($row['besoins_count'] ?? 0)
                ];
            }, $results);
        } catch (PDOException $e) {
            error_log("Erreur getByRegion: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtient les statistiques détaillées par ville
     * 
     * @param int $limit Limite de résultats (0 = tous)
     * @return array
     */
    public function getByCity(int $limit = 20): array
    {
        try {
            $limitClause = $limit > 0 ? "LIMIT " . $limit : "";
            
            $query = <<<SQL
                SELECT 
                    v.nom AS ville,
                    r.nom AS region,
                    COUNT(b.id_besoin) AS besoins_count,
                    COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS besoins_total,
                    COALESCE(SUM(dist.quantite_attribuee * p.prix_moyen), 0) AS distribue
                FROM ville v
                LEFT JOIN region r ON r.id_region = v.id_region
                LEFT JOIN besoin b ON b.id_ville = v.id_ville
                LEFT JOIN distribution dist ON dist.id_ville = v.id_ville
                LEFT JOIN don d ON d.id_don = dist.id_don
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = b.id_type OR p.id_type = d.id_type
                GROUP BY v.id_ville, v.nom, r.nom
                ORDER BY besoins_total DESC
                {$limitClause}
SQL;

            $stmt = $this->db->query($query);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array_map(function($row) {
                $besoinsTotal = (float) ($row['besoins_total'] ?? 0);
                $distribue = (float) ($row['distribue'] ?? 0);
                $restant = max(0, $besoinsTotal - $distribue);
                
                return [
                    'ville' => (string) ($row['ville'] ?? ''),
                    'region' => (string) ($row['region'] ?? ''),
                    'besoins_count' => (int) ($row['besoins_count'] ?? 0),
                    'besoins_total' => $besoinsTotal,
                    'distribue' => $distribue,
                    'restant' => $restant,
                    'taux_satisfaction' => $besoinsTotal > 0 ? ($distribue / $besoinsTotal) * 100 : 0
                ];
            }, $results);
        } catch (PDOException $e) {
            error_log("Erreur getByCity: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtient l'évolution temporelle des dons et distributions
     * 
     * @param int $days Nombre de jours à récupérer
     * @return array
     */
    public function getTimeline(int $days = 30): array
    {
        try {
            $query = <<<SQL
                SELECT 
                    DATE(date_don) AS date,
                    COALESCE(SUM(d.quantite * p.prix_moyen), 0) AS dons_valeur,
                    COUNT(d.id_don) AS dons_count
                FROM don d
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
                WHERE date_don >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(date_don)
                ORDER BY date ASC
SQL;

            $stmt = $this->db->prepare($query);
            $stmt->execute([$days]);
            $donsTimeline = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $query2 = <<<SQL
                SELECT 
                    DATE(date_dispatch) AS date,
                    COALESCE(SUM(dist.quantite_attribuee * p.prix_moyen), 0) AS distributions_valeur,
                    COUNT(dist.id_dispatch) AS distributions_count
                FROM distribution dist
                INNER JOIN don d ON d.id_don = dist.id_don
                LEFT JOIN (
                    SELECT id_type, AVG(prix_unitaire) AS prix_moyen
                    FROM besoin
                    GROUP BY id_type
                ) p ON p.id_type = d.id_type
                WHERE date_dispatch >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(date_dispatch)
                ORDER BY date ASC
SQL;

            $stmt2 = $this->db->prepare($query2);
            $stmt2->execute([$days]);
            $distributionsTimeline = $stmt2->fetchAll(PDO::FETCH_ASSOC);

            return [
                'dons' => array_map(function($row) {
                    return [
                        'date' => (string) ($row['date'] ?? ''),
                        'valeur' => (float) ($row['dons_valeur'] ?? 0),
                        'count' => (int) ($row['dons_count'] ?? 0)
                    ];
                }, $donsTimeline),
                'distributions' => array_map(function($row) {
                    return [
                        'date' => (string) ($row['date'] ?? ''),
                        'valeur' => (float) ($row['distributions_valeur'] ?? 0),
                        'count' => (int) ($row['distributions_count'] ?? 0)
                    ];
                }, $distributionsTimeline)
            ];
        } catch (PDOException $e) {
            error_log("Erreur getTimeline: " . $e->getMessage());
            return [
                'dons' => [],
                'distributions' => []
            ];
        }
    }

    /**
     * Obtient toutes les statistiques du rapport
     * 
     * @return array
     */
    public function getAllStats(): array
    {
        return [
            'summary' => $this->getSummary(),
            'by_type' => $this->getByType(),
            'by_region' => $this->getByRegion(),
            'by_city' => $this->getByCity(10),
            'timeline' => $this->getTimeline(30)
        ];
    }

    /**
     * Obtient les statistiques globales (compteurs)
     * 
     * @return array
     */
    public function getGlobalStats(): array
    {
        try {
            $query = <<<SQL
                SELECT
                    (SELECT COUNT(*) FROM region) AS regions,
                    (SELECT COUNT(*) FROM ville) AS villes,
                    (SELECT COUNT(*) FROM besoin) AS besoins,
                    (SELECT COUNT(*) FROM don) AS dons,
                    (SELECT COUNT(*) FROM distribution) AS distributions,
                    (SELECT COUNT(DISTINCT id_type) FROM type_besoin) AS types
SQL;

            $stmt = $this->db->query($query);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'regions' => (int) ($result['regions'] ?? 0),
                'villes' => (int) ($result['villes'] ?? 0),
                'besoins' => (int) ($result['besoins'] ?? 0),
                'dons' => (int) ($result['dons'] ?? 0),
                'distributions' => (int) ($result['distributions'] ?? 0),
                'types' => (int) ($result['types'] ?? 0)
            ];
        } catch (PDOException $e) {
            error_log("Erreur getGlobalStats: " . $e->getMessage());
            return [
                'regions' => 0,
                'villes' => 0,
                'besoins' => 0,
                'dons' => 0,
                'distributions' => 0,
                'types' => 0
            ];
        }
    }
}
