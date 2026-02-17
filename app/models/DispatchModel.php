<?php
namespace app\models;

use Flight;
use PDO;

class DispatchModel
{
    public function getDonsDisponibles()
    {
        $sql = "SELECT d.id_don, d.id_type, tb.libelle AS type_besoin,
                       d.quantite AS quantite_totale, d.date_don,
                       COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_distribuee,
                       d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_restante
                FROM don d
                JOIN type_besoin tb ON tb.id_type = d.id_type
                LEFT JOIN distribution dist ON dist.id_don = d.id_don
                GROUP BY d.id_don, d.id_type, tb.libelle, d.quantite, d.date_don
                HAVING d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) > 0
                ORDER BY d.date_don ASC, d.id_don ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBesoinsNonSatisfaits($idType)
    {
        $sql = "SELECT b.id_besoin, b.id_ville, v.nom AS ville, b.id_type,
                       b.nom_produit, b.quantite AS quantite_demandee, b.date_saisie
                FROM besoin b
                JOIN ville v ON v.id_ville = b.id_ville
                WHERE b.id_type = ?
                ORDER BY b.date_saisie ASC, b.id_besoin ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$idType]);
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sqlDist = "SELECT dist.id_ville, COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_attribuee
                    FROM distribution dist
                    JOIN don d ON d.id_don = dist.id_don
                    WHERE d.id_type = ?
                    GROUP BY dist.id_ville";
        $stmtDist = Flight::db()->prepare($sqlDist);
        $stmtDist->execute([$idType]);
        $distRows = $stmtDist->fetchAll(PDO::FETCH_ASSOC);

        $distributedByCity = [];
        foreach ($distRows as $row) {
            $distributedByCity[(int) $row['id_ville']] = (float) $row['quantite_attribuee'];
        }

        $result = [];
        foreach ($needs as $need) {
            $cityId = (int) $need['id_ville'];
            $alreadyDistributed = $distributedByCity[$cityId] ?? 0.0;
            $needQty = (float) $need['quantite_demandee'];
            $consumed = min($needQty, max($alreadyDistributed, 0));
            $remaining = $needQty - $consumed;
            $distributedByCity[$cityId] = max($alreadyDistributed - $consumed, 0);

            if ($remaining > 0) {
                $need['quantite_restante'] = $remaining;
                $result[] = $need;
            }
        }

        return $result;
    }

    public function getVillesEligibles($idType)
    {
        $needs = $this->getBesoinsNonSatisfaits($idType);
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

        usort($cities, function($a, $b) {
            return strcmp($a['nom'], $b['nom']);
        });

        return array_values($cities);
    }

    public function getDonRemainingsByIds(array $donIds)
    {
        if (empty($donIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($donIds), '?'));
        $sql = "SELECT d.id_don, d.id_type, d.quantite AS quantite_totale,
                       COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_distribuee,
                       d.quantite - COALESCE(SUM(dist.quantite_attribuee), 0) AS quantite_restante
                FROM don d
                LEFT JOIN distribution dist ON dist.id_don = d.id_don
                WHERE d.id_don IN ($placeholders)
                GROUP BY d.id_don, d.id_type, d.quantite";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute($donIds);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $idDon = (int) $row['id_don'];
            $row['quantite_totale'] = (float) $row['quantite_totale'];
            $row['quantite_distribuee'] = (float) $row['quantite_distribuee'];
            $row['quantite_restante'] = (float) $row['quantite_restante'];
            $map[$idDon] = $row;
        }

        return $map;
    }

    public function getCityTypeRemainings(array $pairs)
    {
        if (empty($pairs)) {
            return [];
        }

        $placeholders = [];
        $params = [];
        foreach ($pairs as $pair) {
            $placeholders[] = '(?, ?)';
            $params[] = (int) ($pair['id_ville'] ?? 0);
            $params[] = (int) ($pair['id_type'] ?? 0);
        }

        $inClause = implode(',', $placeholders);

        $sqlNeeds = "SELECT b.id_ville, b.id_type, SUM(b.quantite) AS quantite_demandee
                     FROM besoin b
                     WHERE (b.id_ville, b.id_type) IN ($inClause)
                     GROUP BY b.id_ville, b.id_type";
        $stmtNeeds = Flight::db()->prepare($sqlNeeds);
        $stmtNeeds->execute($params);
        $needRows = $stmtNeeds->fetchAll(PDO::FETCH_ASSOC);

        $sqlDist = "SELECT dist.id_ville, d.id_type, SUM(dist.quantite_attribuee) AS quantite_distribuee
                    FROM distribution dist
                    JOIN don d ON d.id_don = dist.id_don
                    WHERE (dist.id_ville, d.id_type) IN ($inClause)
                    GROUP BY dist.id_ville, d.id_type";
        $stmtDist = Flight::db()->prepare($sqlDist);
        $stmtDist->execute($params);
        $distRows = $stmtDist->fetchAll(PDO::FETCH_ASSOC);

        $distMap = [];
        foreach ($distRows as $row) {
            $key = (int) $row['id_ville'] . '-' . (int) $row['id_type'];
            $distMap[$key] = (float) $row['quantite_distribuee'];
        }

        $remainings = [];
        foreach ($needRows as $row) {
            $key = (int) $row['id_ville'] . '-' . (int) $row['id_type'];
            $demand = (float) $row['quantite_demandee'];
            $distributed = $distMap[$key] ?? 0.0;
            $remaining = $demand - $distributed;
            if ($remaining > 0) {
                $remainings[$key] = $remaining;
            }
        }

        return $remainings;
    }

    public function createDistribution($idDon, $idVille, $quantite)
    {
        $sql = "INSERT INTO distribution (id_don, id_ville, quantite_attribuee, date_dispatch)
                VALUES (?, ?, ?, NOW())";
        $stmt = Flight::db()->prepare($sql);
        return $stmt->execute([$idDon, $idVille, $quantite]);
    }

    public function beginTransaction()
    {
        Flight::db()->beginTransaction();
    }

    public function commit()
    {
        Flight::db()->commit();
    }

    public function rollback()
    {
        if (Flight::db()->inTransaction()) {
            Flight::db()->rollBack();
        }
    }
}
?>
