<?php

namespace app\models;

use Flight;
use PDO;

class DispatchModel
{
    private const RESET_SEED_FILE = __DIR__ . '/../db/reset_besoins_dons.sql';
    private static bool $schemaChecked = false;

    public function __construct()
    {
        $this->ensureDispatchSchema();
    }

    private function ensureDispatchSchema(): void
    {
        if (self::$schemaChecked) {
            return;
        }

        $db = Flight::db();

        // Best effort: align local schema with current dispatch logic.
        $queries = [
            "ALTER TABLE don
             ADD COLUMN IF NOT EXISTS quantite_utilisee DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER quantite",
            "ALTER TABLE besoin
             ADD COLUMN IF NOT EXISTS quantite_satisfaite DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER quantite",
            "ALTER TABLE distribution
             ADD COLUMN IF NOT EXISTS mode_dispatch ENUM('fifo', 'proportionnel', 'priorite_petits') NOT NULL DEFAULT 'fifo' AFTER date_dispatch",
            "ALTER TABLE distribution
             MODIFY COLUMN mode_dispatch ENUM('fifo', 'proportionnel', 'priorite_petits') NOT NULL DEFAULT 'fifo'",
        ];

        foreach ($queries as $sql) {
            try {
                $db->exec($sql);
            } catch (\Throwable $e) {
                // Ignore to keep compatibility across environments/privileges.
            }
        }

        self::$schemaChecked = true;
    }

    public function getTypeLabelsMap(): array
    {
        $sql = "SELECT id_type, categorie AS libelle FROM type_besoin ORDER BY id_type ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id_type']] = (string) $row['libelle'];
        }

        return $map;
    }

    public function getRemainingDonByTypeMap(): array
    {
        $sql = "SELECT d.id_type,
                       COALESCE(SUM(GREATEST(d.quantite - d.quantite_utilisee, 0)), 0) AS don_disponible
                FROM don d
                GROUP BY d.id_type";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id_type']] = (float) $row['don_disponible'];
        }

        return $map;
    }

    public function getAvailableDonsByType(int $idType): array
    {
        $sql = "SELECT d.id_don, d.id_type, d.date_don,
                       GREATEST(d.quantite - d.quantite_utilisee, 0) AS restant
                FROM don d
                WHERE d.id_type = ?
                HAVING restant > 0
                ORDER BY d.date_don ASC, d.id_don ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$idType]);

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($rows as &$row) {
            $row['id_don'] = (int) $row['id_don'];
            $row['id_type'] = (int) $row['id_type'];
            $row['restant'] = (float) $row['restant'];
        }
        unset($row);

        return $rows;
    }

    public function getDonsDisponibles(): array
    {
        $sql = "SELECT d.id_don, d.id_type, tb.categorie AS type_besoin,
                       d.quantite AS quantite_totale, d.date_don,
                       d.quantite_utilisee AS quantite_utilisee,
                       GREATEST(d.quantite - d.quantite_utilisee, 0) AS quantite_restante
                FROM don d
                JOIN type_besoin tb ON tb.id_type = d.id_type
                WHERE d.quantite - d.quantite_utilisee > 0
                ORDER BY d.date_don ASC, d.id_don ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBesoinsNonSatisfaits(int $idType): array
    {
        $sql = "SELECT b.id_besoin, b.id_ville, v.nom AS ville, b.id_type,
                       b.nom_produit, b.quantite AS quantite_demandee,
                       b.quantite_satisfaite,
                       GREATEST(b.quantite - b.quantite_satisfaite, 0) AS quantite_restante,
                       b.date_saisie
                FROM besoin b
                JOIN ville v ON v.id_ville = b.id_ville
                WHERE b.id_type = ?
                  AND b.quantite - b.quantite_satisfaite > 0
                ORDER BY b.date_saisie ASC, b.id_besoin ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$idType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVillesEligibles(int $idType): array
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

        usort($cities, function ($a, $b) {
            return strcmp($a['nom'], $b['nom']);
        });

        return array_values($cities);
    }

    public function getDonRemainingsByIds(array $donIds): array
    {
        if (empty($donIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($donIds), '?'));
        $sql = "SELECT d.id_don, d.id_type, d.quantite AS quantite_totale,
                       d.quantite_utilisee AS quantite_utilisee,
                       GREATEST(d.quantite - d.quantite_utilisee, 0) AS quantite_restante
                FROM don d
                WHERE d.id_don IN ($placeholders)
                GROUP BY d.id_don, d.id_type, d.quantite, d.quantite_utilisee";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute($donIds);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $idDon = (int) $row['id_don'];
            $row['quantite_totale'] = (float) $row['quantite_totale'];
            $row['quantite_utilisee'] = (float) $row['quantite_utilisee'];
            $row['quantite_restante'] = (float) $row['quantite_restante'];
            $map[$idDon] = $row;
        }

        return $map;
    }

    public function getCityTypeRemainings(array $pairs): array
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

        $sqlNeeds = "SELECT b.id_ville, b.id_type,
                            SUM(GREATEST(b.quantite - b.quantite_satisfaite, 0)) AS quantite_restante
                     FROM besoin b
                     WHERE (b.id_ville, b.id_type) IN ($inClause)
                     GROUP BY b.id_ville, b.id_type";
        $stmtNeeds = Flight::db()->prepare($sqlNeeds);
        $stmtNeeds->execute($params);
        $needRows = $stmtNeeds->fetchAll(PDO::FETCH_ASSOC);

        $remainings = [];
        foreach ($needRows as $row) {
            $key = (int) $row['id_ville'] . '-' . (int) $row['id_type'];
            $remaining = (float) $row['quantite_restante'];
            if ($remaining > 0) {
                $remainings[$key] = $remaining;
            }
        }

        return $remainings;
    }

    public function createDistribution(int $idDon, int $idVille, int $idType, float $quantite, string $modeDispatch = 'fifo'): bool
    {
        $sql = "INSERT INTO distribution (id_don, id_ville, quantite_attribuee, date_dispatch, mode_dispatch)
                VALUES (?, ?, ?, NOW(), ?)";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$idDon, $idVille, $quantite, $modeDispatch]);

        $sqlDon = "UPDATE don
                   SET quantite_utilisee = LEAST(quantite, quantite_utilisee + ?)
                   WHERE id_don = ?";
        $stmtDon = Flight::db()->prepare($sqlDon);
        $stmtDon->execute([$quantite, $idDon]);

        $this->applyBesoinSatisfaction($idVille, $idType, $quantite);
        return true;
    }

    private function applyBesoinSatisfaction(int $idVille, int $idType, float $quantite): void
    {
        $remaining = (float) $quantite;
        if ($remaining <= 0) {
            return;
        }

        $sql = "SELECT id_besoin, quantite, quantite_satisfaite
                FROM besoin
                WHERE id_ville = ? AND id_type = ? AND quantite_satisfaite < quantite
                ORDER BY date_saisie ASC, id_besoin ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$idVille, $idType]);
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($needs as $need) {
            if ($remaining <= 0) {
                break;
            }

            $needQty = (float) $need['quantite'];
            $satisfied = (float) $need['quantite_satisfaite'];
            $needRemaining = max($needQty - $satisfied, 0);
            if ($needRemaining <= 0) {
                continue;
            }

            $allocated = min($remaining, $needRemaining);

            $sqlUpdate = "UPDATE besoin
                          SET quantite_satisfaite = LEAST(quantite, quantite_satisfaite + ?)
                          WHERE id_besoin = ?";
            $stmtUpdate = Flight::db()->prepare($sqlUpdate);
            $stmtUpdate->execute([$allocated, (int) $need['id_besoin']]);

            $remaining -= $allocated;
        }

        if ($remaining > 0.00001) {
            throw new \RuntimeException('Besoin insuffisant pour enregistrer cette distribution.');
        }
    }

    public function beginTransaction(): void
    {
        Flight::db()->beginTransaction();
    }

    public function commit(): void
    {
        Flight::db()->commit();
    }

    public function rollback(): void
    {
        if (Flight::db()->inTransaction()) {
            Flight::db()->rollBack();
        }
    }

    public function resetBesoinsEtDons(): void
    {
        $db = Flight::db();
        $seedSql = @file_get_contents(self::RESET_SEED_FILE);
        if ($seedSql === false || trim($seedSql) === '') {
            throw new \RuntimeException('Fichier de réinitialisation introuvable ou vide.');
        }

        $foreignKeyDisabled = false;
        try {
            $db->exec('SET FOREIGN_KEY_CHECKS = 0');
            $foreignKeyDisabled = true;
            $db->exec('TRUNCATE TABLE distribution');
            try {
                $db->exec('TRUNCATE TABLE achat');
            } catch (\Throwable $e) {
                // Le module achat peut ne pas exister selon l'environnement.
            }
            $db->exec('TRUNCATE TABLE don');
            $db->exec('TRUNCATE TABLE besoin');

            $this->execSqlScript($db, $seedSql);
            $db->exec('UPDATE don SET quantite_utilisee = 0');
            $db->exec('UPDATE besoin SET quantite_satisfaite = 0');
        } finally {
            if ($foreignKeyDisabled) {
                $db->exec('SET FOREIGN_KEY_CHECKS = 1');
            }
        }
    }

    private function execSqlScript(PDO $db, string $sqlScript): void
    {
        $statements = preg_split('/;\\s*[\\r\\n]+/', $sqlScript);
        if ($statements === false) {
            throw new \RuntimeException('Impossible de parser le script de réinitialisation.');
        }

        foreach ($statements as $statement) {
            $trimmed = trim($statement);
            if ($trimmed === '') {
                continue;
            }
            $db->exec($trimmed);
        }
    }
}
