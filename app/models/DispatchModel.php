<?php

namespace app\models;

use Flight;
use PDO;

class DispatchModel
{
    private static function db(): PDO
    {
        return Flight::db();
    }

    public static function getAvailableDonStates(): array
    {
        $sql = "
            SELECT
                d.id_don,
                d.id_type,
                tb.libelle AS type_besoin,
                d.quantite AS quantite_totale,
                d.date_don,
                COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_distribuee,
                d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_restante
            FROM don d
            JOIN type_besoin tb ON tb.id_type = d.id_type
            LEFT JOIN distribution dist ON dist.id_don = d.id_don
            GROUP BY d.id_don, d.id_type, tb.libelle, d.quantite, d.date_don
            HAVING d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) > 0
            ORDER BY d.date_don ASC, d.id_don ASC
        ";

        return self::db()->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getUnsatisfiedNeedsByType(int $idType): array
    {
        $needs = self::getNeedRowsByType($idType);
        $distributedByCity = self::getDistributedTotalsByCityForType($idType);

        $result = [];
        foreach ($needs as $need) {
            $cityId = (int) $need['id_ville'];
            $alreadyDistributed = (float) ($distributedByCity[$cityId] ?? 0.0);
            $needQty = (float) $need['quantite_demandee'];

            $consumedOnThisNeed = min($needQty, max($alreadyDistributed, 0));
            $remaining = $needQty - $consumedOnThisNeed;
            $distributedByCity[$cityId] = max($alreadyDistributed - $consumedOnThisNeed, 0);

            if ($remaining > 0) {
                $need['quantite_restante'] = $remaining;
                $result[] = $need;
            }
        }

        return $result;
    }

    public static function getEligibleCitiesByType(int $idType): array
    {
        $needs = self::getUnsatisfiedNeedsByType($idType);
        $cities = [];

        foreach ($needs as $need) {
            $cityId = (int) $need['id_ville'];
            if (!isset($cities[$cityId])) {
                $cities[$cityId] = [
                    'id_ville' => $cityId,
                    'nom' => $need['ville'],
                    'besoin_restant' => 0.0,
                ];
            }
            $cities[$cityId]['besoin_restant'] += (float) $need['quantite_restante'];
        }

        usort($cities, static fn($a, $b) => strcmp((string) $a['nom'], (string) $b['nom']));
        return array_values($cities);
    }

    public static function getDonRemainingsByIds(array $donIds): array
    {
        if (empty($donIds)) {
            return [];
        }

        $params = [];
        $placeholders = [];
        foreach ($donIds as $index => $donId) {
            $key = ':id_' . $index;
            $placeholders[] = $key;
            $params[$key] = (int) $donId;
        }

        $sql = "
            SELECT
                d.id_don,
                d.id_type,
                d.quantite AS quantite_totale,
                COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_distribuee,
                d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_restante
            FROM don d
            LEFT JOIN distribution dist ON dist.id_don = d.id_don
            WHERE d.id_don IN (" . implode(', ', $placeholders) . ")
            GROUP BY d.id_don, d.id_type, d.quantite
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id_don']] = [
                'id_type' => (int) $row['id_type'],
                'quantite_restante' => (float) $row['quantite_restante'],
                'quantite_totale' => (float) $row['quantite_totale'],
            ];
        }

        return $map;
    }

    public static function getCityTypeRemainings(array $pairs): array
    {
        if (empty($pairs)) {
            return [];
        }

        $needRows = self::getNeedTotalsByPairs($pairs);
        $distRows = self::getDistributionTotalsByPairs($pairs);

        $needMap = [];
        foreach ($needRows as $row) {
            $key = $row['id_ville'] . '-' . $row['id_type'];
            $needMap[$key] = (float) $row['quantite_besoin'];
        }

        $distMap = [];
        foreach ($distRows as $row) {
            $key = $row['id_ville'] . '-' . $row['id_type'];
            $distMap[$key] = (float) $row['quantite_attribuee'];
        }

        $result = [];
        foreach ($needMap as $key => $needQty) {
            $result[$key] = max($needQty - ($distMap[$key] ?? 0.0), 0);
        }

        return $result;
    }

    public static function createDistribution(int $idDon, int $idVille, float $quantite): void
    {
        $sql = "
            INSERT INTO distribution (id_don, id_ville, quantite_attribuee, date_dispatch)
            VALUES (:id_don, :id_ville, :quantite_attribuee, NOW())
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute([
            ':id_don' => $idDon,
            ':id_ville' => $idVille,
            ':quantite_attribuee' => $quantite,
        ]);
    }

    public static function beginTransaction(): void
    {
        self::db()->beginTransaction();
    }

    public static function commit(): void
    {
        self::db()->commit();
    }

    public static function rollback(): void
    {
        if (self::db()->inTransaction()) {
            self::db()->rollBack();
        }
    }

    private static function getNeedRowsByType(int $idType): array
    {
        $sql = "
            SELECT
                b.id_besoin,
                b.id_ville,
                v.nom AS ville,
                b.id_type,
                b.nom_produit,
                b.quantite AS quantite_demandee,
                b.date_saisie
            FROM besoin b
            JOIN ville v ON v.id_ville = b.id_ville
            WHERE b.id_type = :id_type
            ORDER BY b.date_saisie ASC, b.id_besoin ASC
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute([':id_type' => $idType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private static function getDistributedTotalsByCityForType(int $idType): array
    {
        $sql = "
            SELECT dist.id_ville, COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_attribuee
            FROM distribution dist
            JOIN don d ON d.id_don = dist.id_don
            WHERE d.id_type = :id_type
            GROUP BY dist.id_ville
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute([':id_type' => $idType]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id_ville']] = (float) $row['quantite_attribuee'];
        }

        return $map;
    }

    private static function getNeedTotalsByPairs(array $pairs): array
    {
        $params = [];
        $where = self::buildPairWhere($pairs, 'b.id_ville', 'b.id_type', $params, 'n');

        $sql = "
            SELECT b.id_ville, b.id_type, SUM(b.quantite) AS quantite_besoin
            FROM besoin b
            WHERE {$where}
            GROUP BY b.id_ville, b.id_type
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private static function getDistributionTotalsByPairs(array $pairs): array
    {
        $params = [];
        $where = self::buildPairWhere($pairs, 'dist.id_ville', 'd.id_type', $params, 'd');

        $sql = "
            SELECT dist.id_ville, d.id_type, SUM(dist.quantite_attribuee) AS quantite_attribuee
            FROM distribution dist
            JOIN don d ON d.id_don = dist.id_don
            WHERE {$where}
            GROUP BY dist.id_ville, d.id_type
        ";

        $stmt = self::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private static function buildPairWhere(array $pairs, string $villeCol, string $typeCol, array &$params, string $prefix): string
    {
        $parts = [];
        foreach (array_values($pairs) as $index => $pair) {
            $villeKey = ':' . $prefix . '_v_' . $index;
            $typeKey = ':' . $prefix . '_t_' . $index;
            $params[$villeKey] = (int) $pair['id_ville'];
            $params[$typeKey] = (int) $pair['id_type'];
            $parts[] = "({$villeCol} = {$villeKey} AND {$typeCol} = {$typeKey})";
        }

        return implode(' OR ', $parts);
    }
}
