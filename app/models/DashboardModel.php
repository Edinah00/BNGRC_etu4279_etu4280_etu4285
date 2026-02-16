<?php

declare(strict_types=1);

class DashboardModel
{
    /** @var \PDO */
    private $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getDashboardData(): array
    {
        return [
            'stats' => $this->getStats(),
            'bar' => $this->getBesoinsByRegion(),
            'pie' => $this->getBesoinsByType(),
            'table' => $this->getTopCities(),
        ];
    }

    private function getStats(): array
    {
        $statsQuery = <<<SQL
SELECT
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
    ) AS valeur_dons_estimee
SQL;

        $statsStmt = $this->db->query($statsQuery);
        $stats = $statsStmt->fetch(\PDO::FETCH_ASSOC) ?: [];

        return [
            'regions' => (int) ($stats['regions'] ?? 0),
            'villes' => (int) ($stats['villes'] ?? 0),
            'besoins' => (int) ($stats['besoins'] ?? 0),
            'dons' => (int) ($stats['dons'] ?? 0),
            'distributions' => (int) ($stats['distributions'] ?? 0),
            'dons_quantite' => (float) ($stats['dons_quantite'] ?? 0),
            'valeur_dons_estimee' => (float) ($stats['valeur_dons_estimee'] ?? 0),
        ];
    }

    private function getBesoinsByRegion(): array
    {
        $barStmt = $this->db->query(
            "SELECT r.nom AS region, COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS total_besoins
             FROM region r
             LEFT JOIN ville v ON v.id_region = r.id_region
             LEFT JOIN besoin b ON b.id_ville = v.id_ville
             GROUP BY r.id_region, r.nom
             ORDER BY total_besoins DESC, r.nom ASC"
        );

        $barRows = $barStmt->fetchAll(\PDO::FETCH_ASSOC);

        return array_map(
            static function (array $row): array {
                return [
                    'region' => (string) ($row['region'] ?? ''),
                    'besoins' => (float) ($row['total_besoins'] ?? 0),
                ];
            },
            $barRows
        );
    }

    private function getBesoinsByType(): array
    {
        $pieStmt = $this->db->query(
            "SELECT t.libelle AS type, COUNT(*) AS total
             FROM type_besoin t
             LEFT JOIN besoin b ON b.id_type = t.id_type
             GROUP BY t.id_type, t.libelle
             HAVING COUNT(b.id_besoin) > 0
             ORDER BY total DESC, t.libelle ASC"
        );

        $pieRows = $pieStmt->fetchAll(\PDO::FETCH_ASSOC);

        return array_map(
            static function (array $row): array {
                return [
                    'name' => (string) ($row['type'] ?? ''),
                    'value' => (int) ($row['total'] ?? 0),
                ];
            },
            $pieRows
        );
    }

    private function getTopCities(): array
    {
        $tableStmt = $this->db->query(
            "SELECT
                v.nom AS ville,
                r.nom AS region,
                COUNT(b.id_besoin) AS besoins_count,
                COALESCE(SUM(b.quantite * b.prix_unitaire), 0) AS total_value
             FROM ville v
             LEFT JOIN region r ON r.id_region = v.id_region
             LEFT JOIN besoin b ON b.id_ville = v.id_ville
             GROUP BY v.id_ville, v.nom, r.nom
             ORDER BY total_value DESC, v.nom ASC
             LIMIT 10"
        );

        $rows = $tableStmt->fetchAll(\PDO::FETCH_ASSOC);

        return array_map(
            static function (array $row): array {
                return [
                    'ville' => (string) ($row['ville'] ?? ''),
                    'region' => (string) ($row['region'] ?? ''),
                    'besoins' => (int) ($row['besoins_count'] ?? 0),
                    'value' => (float) ($row['total_value'] ?? 0),
                ];
            },
            $rows
        );
    }
}
