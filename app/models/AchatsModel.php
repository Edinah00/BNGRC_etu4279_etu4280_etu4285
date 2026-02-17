<?php
namespace app\models;

use Flight;
use PDO;

class AchatsModel
{
    public function getContext($villeId = null, $typeId = null, $periode = 'all')
    {
        $feeRate = $this->getFeeRate();
        $money = $this->getMoneySummary();
        $needs = $this->getBesoinsAchetables($villeId, $typeId, $feeRate, $money['argent_disponible']);
        $history = $this->getHistorique($villeId, $periode);

        return [
            'meta' => [
                'argent_total_dons' => $money['argent_total_dons'],
                'argent_utilise' => $money['argent_utilise'],
                'argent_disponible' => $money['argent_disponible'],
                'taux_frais' => $feeRate,
            ],
            'needs' => $needs,
            'history' => $history['rows'],
            'history_summary' => $history['summary'],
            'villes' => $this->getVilles(),
            'types' => $this->getTypesAchetables(),
        ];
    }

    public function createAchat($besoinId, $quantite)
    {
        if ($quantite <= 0) {
            throw new \Exception('La quantité doit être supérieure à 0.');
        }

        Flight::db()->beginTransaction();

        try {
            $need = $this->getBesoinPourAchat($besoinId);
            if (!$need) {
                throw new \Exception('Ce besoin n\'existe pas ou est déjà entièrement couvert.');
            }

            if (!in_array($need['categorie'], ['nature', 'matériaux'])) {
                throw new \Exception('Seuls les besoins en nature et en matériaux peuvent être achetés.');
            }

            $remainingNeed = $this->getQuantiteRestante($besoinId);
            if ($remainingNeed <= 0) {
                throw new \Exception('Ce besoin est déjà entièrement couvert.');
            }

            if ($quantite > $remainingNeed) {
                throw new \Exception('La quantité doit être entre 1 et ' . $remainingNeed . '.');
            }

            $donRestant = $this->getDonRestantParType($need['id_type']);
            if ($donRestant > 0) {
                throw new \Exception('Ce produit existe encore dans les dons disponibles (' . $donRestant . '). Utilisez d\'abord les dons existants.');
            }

            $feeRate = $this->getFeeRate();
            $montantHt = $quantite * (float) $need['prix_unitaire'];
            $montantFrais = $montantHt * ($feeRate / 100);
            $montantTtc = $montantHt + $montantFrais;

            $money = $this->getMoneySummary();
            if ($montantTtc > $money['argent_disponible']) {
                throw new \Exception('Argent insuffisant. Disponible: ' . $money['argent_disponible'] . ' Ar, Nécessaire: ' . $montantTtc . ' Ar.');
            }

            $sql = "INSERT INTO achat (id_besoin, id_ville, id_type, nom_produit, quantite, prix_unitaire, montant_ht, taux_frais, montant_frais, montant_ttc)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = Flight::db()->prepare($sql);
            $stmt->execute([
                $need['id_besoin'],
                $need['id_ville'],
                $need['id_type'],
                $need['nom_produit'],
                $quantite,
                $need['prix_unitaire'],
                $montantHt,
                $feeRate,
                $montantFrais,
                $montantTtc,
            ]);

            $achatId = (int) Flight::db()->lastInsertId();
            Flight::db()->commit();

            return [
                'id_achat' => $achatId,
                'montant_ttc' => $montantTtc,
                'montant_ht' => $montantHt,
                'montant_frais' => $montantFrais,
            ];
        } catch (\Exception $e) {
            if (Flight::db()->inTransaction()) {
                Flight::db()->rollBack();
            }
            throw $e;
        }
    }

    public function updateFeeRate($rate)
    {
        if ($rate < 0 || $rate > 100) {
            throw new \Exception('Le taux de frais doit être entre 0 et 100.');
        }

        $sql = "INSERT INTO configuration (cle, valeur, description)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([
            'taux_frais_achat',
            number_format($rate, 2, '.', ''),
            'Taux de frais d\'achat en pourcentage',
        ]);
    }

    public function getFeeRate()
    {
        $sql = "SELECT valeur FROM configuration WHERE cle = ? LIMIT 1";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute(['taux_frais_achat']);
        $value = $stmt->fetchColumn();

        if ($value === false) {
            return 10.0;
        }

        return max(0.0, min(100.0, (float) $value));
    }

    public function getMoneySummary()
    {
        $sql = "SELECT
                    COALESCE((
                        SELECT SUM(d.quantite)
                        FROM don d
                        JOIN type_besoin tb ON tb.id_type = d.id_type
                        WHERE tb.categorie = 'argent'
                    ), 0) AS argent_total_dons,
                    COALESCE((SELECT SUM(montant_ttc) FROM achat), 0) AS argent_utilise";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $total = (float) ($row['argent_total_dons'] ?? 0);
        $used = (float) ($row['argent_utilise'] ?? 0);

        return [
            'argent_total_dons' => $total,
            'argent_utilise' => $used,
            'argent_disponible' => $total - $used,
        ];
    }

    public function getVilles()
    {
        $sql = "SELECT id_ville AS id, nom FROM ville ORDER BY nom ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTypesAchetables()
    {
        $sql = "SELECT id_type AS id, libelle FROM type_besoin WHERE categorie IN ('nature', 'matériaux') ORDER BY id_type ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getBesoinsAchetables($villeId, $typeId, $feeRate, $moneyAvailable)
    {
        $sql = "SELECT b.id_besoin, b.id_ville, v.nom AS ville, b.id_type,
                       tb.libelle AS type_besoin, b.nom_produit, b.quantite, b.prix_unitaire, b.date_saisie
                FROM besoin b
                JOIN ville v ON v.id_ville = b.id_ville
                JOIN type_besoin tb ON tb.id_type = b.id_type
                WHERE tb.categorie IN ('nature', 'matériaux')";
        $params = [];

        if ($villeId !== null) {
            $sql .= " AND b.id_ville = ?";
            $params[] = $villeId;
        }
        if ($typeId !== null) {
            $sql .= " AND b.id_type = ?";
            $params[] = $typeId;
        }

        $sql .= " ORDER BY b.date_saisie ASC, b.id_besoin ASC";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute($params);
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($needs)) {
            return [];
        }

        $distMap = $this->getDistribueParVilleType();
        $achatMap = $this->getAchatParBesoin();
        $donMap = $this->getDonRestantParTypeMap();

        $rows = [];
        foreach ($needs as $need) {
            $key = $need['id_ville'] . '-' . $need['id_type'];
            $alreadyDistributed = (float) ($distMap[$key] ?? 0.0);
            $needQty = (float) $need['quantite'];

            $consumed = min($needQty, max($alreadyDistributed, 0));
            $afterDist = max($needQty - $consumed, 0);
            $distMap[$key] = max($alreadyDistributed - $consumed, 0);

            $alreadyBought = (float) ($achatMap[$need['id_besoin']] ?? 0.0);
            $remainingQty = max($afterDist - $alreadyBought, 0);

            if ($remainingQty <= 0) {
                continue;
            }

            $unitPrice = (float) $need['prix_unitaire'];
            $montantHt = $remainingQty * $unitPrice;
            $montantFrais = $montantHt * ($feeRate / 100);
            $montantTtc = $montantHt + $montantFrais;
            $donRestant = (float) ($donMap[$need['id_type']] ?? 0.0);

            $rows[] = [
                'id_besoin' => $need['id_besoin'],
                'id_ville' => $need['id_ville'],
                'ville' => $need['ville'],
                'id_type' => $need['id_type'],
                'type_besoin' => $need['type_besoin'],
                'nom_produit' => $need['nom_produit'],
                'quantite_demandee' => $needQty,
                'quantite_recue_distribution' => $consumed,
                'quantite_recue_achat' => $alreadyBought,
                'quantite_restante' => $remainingQty,
                'prix_unitaire' => $unitPrice,
                'montant_ht' => $montantHt,
                'montant_frais' => $montantFrais,
                'montant_ttc' => $montantTtc,
                'don_restant_type' => $donRestant,
                'achat_bloque' => $donRestant > 0,
                'achat_possible_budget' => $montantTtc <= $moneyAvailable,
                'date_saisie' => $need['date_saisie'],
            ];
        }

        return $rows;
    }

    private function getDistribueParVilleType()
    {
        $sql = "SELECT dist.id_ville, d.id_type, SUM(dist.quantite_attribuee) AS quantite
                FROM distribution dist
                JOIN don d ON d.id_don = dist.id_don
                GROUP BY dist.id_ville, d.id_type";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[$row['id_ville'] . '-' . $row['id_type']] = (float) $row['quantite'];
        }
        return $map;
    }

    private function getAchatParBesoin()
    {
        $sql = "SELECT id_besoin, SUM(quantite) AS quantite FROM achat GROUP BY id_besoin";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[$row['id_besoin']] = (float) $row['quantite'];
        }
        return $map;
    }

    private function getDonRestantParTypeMap()
    {
        $sql = "SELECT d.id_type,
                       SUM(GREATEST(d.quantite - COALESCE(x.distributed_qty, 0), 0)) AS quantite_restante
                FROM don d
                LEFT JOIN (
                    SELECT id_don, SUM(quantite_attribuee) AS distributed_qty
                    FROM distribution
                    GROUP BY id_don
                ) x ON x.id_don = d.id_don
                JOIN type_besoin tb ON tb.id_type = d.id_type
                WHERE tb.categorie IN ('nature', 'matériaux')
                GROUP BY d.id_type";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $map = [];
        foreach ($rows as $row) {
            $map[$row['id_type']] = (float) $row['quantite_restante'];
        }
        return $map;
    }

    private function getHistorique($villeId, $periode)
    {
        $params = [];
        $conditions = [];

        if ($villeId !== null) {
            $conditions[] = "a.id_ville = ?";
            $params[] = $villeId;
        }

        $periodeSql = $this->getPeriodeCondition($periode, $params);
        if ($periodeSql !== '') {
            $conditions[] = $periodeSql;
        }

        $where = empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);

        $sqlRows = "SELECT a.id_achat, a.date_achat, v.nom AS ville, tb.libelle AS type_besoin,
                           a.nom_produit, a.quantite, a.prix_unitaire, a.montant_ht,
                           a.taux_frais, a.montant_frais, a.montant_ttc
                    FROM achat a
                    JOIN ville v ON v.id_ville = a.id_ville
                    JOIN type_besoin tb ON tb.id_type = a.id_type
                    $where
                    ORDER BY a.date_achat DESC, a.id_achat DESC";
        $stmtRows = Flight::db()->prepare($sqlRows);
        $stmtRows->execute($params);
        $rows = $stmtRows->fetchAll(PDO::FETCH_ASSOC);

        $sqlSummary = "SELECT COALESCE(SUM(a.montant_ht), 0) AS total_ht,
                              COALESCE(SUM(a.montant_frais), 0) AS total_frais,
                              COALESCE(SUM(a.montant_ttc), 0) AS total_ttc,
                              COUNT(a.id_achat) AS nb_achats
                       FROM achat a $where";
        $stmtSummary = Flight::db()->prepare($sqlSummary);
        $stmtSummary->execute($params);
        $summary = $stmtSummary->fetch(PDO::FETCH_ASSOC);

        return [
            'rows' => $rows,
            'summary' => [
                'total_ht' => (float) ($summary['total_ht'] ?? 0),
                'total_frais' => (float) ($summary['total_frais'] ?? 0),
                'total_ttc' => (float) ($summary['total_ttc'] ?? 0),
                'nb_achats' => (int) ($summary['nb_achats'] ?? 0),
            ],
        ];
    }

    private function getPeriodeCondition($periode, &$params)
    {
        switch ($periode) {
            case 'month':
                $params[] = date('Y-m-01 00:00:00');
                return 'a.date_achat >= ?';
            case '7days':
                $params[] = date('Y-m-d 00:00:00', strtotime('-7 days'));
                return 'a.date_achat >= ?';
            case '30days':
                $params[] = date('Y-m-d 00:00:00', strtotime('-30 days'));
                return 'a.date_achat >= ?';
            default:
                return '';
        }
    }

    private function getBesoinPourAchat($besoinId)
    {
        $sql = "SELECT b.*, tb.categorie FROM besoin b
                JOIN type_besoin tb ON tb.id_type = b.id_type
                WHERE b.id_besoin = ? LIMIT 1";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$besoinId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getQuantiteRestante($besoinId)
    {
        $sqlNeed = "SELECT id_ville, id_type, quantite FROM besoin WHERE id_besoin = ? LIMIT 1";
        $stmt = Flight::db()->prepare($sqlNeed);
        $stmt->execute([$besoinId]);
        $need = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$need) {
            return 0.0;
        }

        $sqlAll = "SELECT id_besoin, quantite FROM besoin
                   WHERE id_ville = ? AND id_type = ?
                   ORDER BY date_saisie ASC, id_besoin ASC";
        $stmt = Flight::db()->prepare($sqlAll);
        $stmt->execute([$need['id_ville'], $need['id_type']]);
        $needRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $sqlDist = "SELECT COALESCE(SUM(dist.quantite_attribuee), 0)
                    FROM distribution dist
                    JOIN don d ON d.id_don = dist.id_don
                    WHERE dist.id_ville = ? AND d.id_type = ?";
        $stmt = Flight::db()->prepare($sqlDist);
        $stmt->execute([$need['id_ville'], $need['id_type']]);
        $distributed = (float) $stmt->fetchColumn();

        foreach ($needRows as $row) {
            $needQty = (float) $row['quantite'];
            $consumed = min($needQty, max($distributed, 0));
            $afterDist = max($needQty - $consumed, 0);
            $distributed = max($distributed - $consumed, 0);

            $sqlAchat = "SELECT COALESCE(SUM(quantite), 0) FROM achat WHERE id_besoin = ?";
            $stmt = Flight::db()->prepare($sqlAchat);
            $stmt->execute([$row['id_besoin']]);
            $alreadyBought = (float) $stmt->fetchColumn();

            $remaining = max($afterDist - $alreadyBought, 0);
            if ($row['id_besoin'] == $besoinId) {
                return $remaining;
            }
        }

        return 0.0;
    }

    private function getDonRestantParType($typeId)
    {
        $sql = "SELECT COALESCE(SUM(GREATEST(d.quantite - COALESCE(x.distributed_qty, 0), 0)), 0)
                FROM don d
                LEFT JOIN (
                    SELECT id_don, SUM(quantite_attribuee) AS distributed_qty
                    FROM distribution
                    GROUP BY id_don
                ) x ON x.id_don = d.id_don
                WHERE d.id_type = ?";
        $stmt = Flight::db()->prepare($sql);
        $stmt->execute([$typeId]);
        return (float) $stmt->fetchColumn();
    }
}
?>