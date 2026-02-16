<?php

declare(strict_types=1);

class AchatsModel
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function listContext(?int $villeId = null, ?int $typeId = null, string $periode = 'all'): array
    {
        $feeRate = $this->getFeeRate();
        $money = $this->getMoneySummary();

        $needs = $this->getPurchasableNeeds($villeId, $typeId, $feeRate, $money['argent_disponible']);
        $history = $this->getPurchaseHistory($villeId, $periode);

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
            'villes' => $this->villes(),
            'types' => $this->typesPurchasable(),
        ];
    }

    public function createPurchase(int $besoinId, float $quantite): array
    {
        if ($quantite <= 0) {
            throw new \RuntimeException('❌ La quantité doit être supérieure à 0.');
        }

        $this->db->beginTransaction();

        try {
            $need = $this->getNeedForUpdate($besoinId);
            if ($need === null) {
                throw new \RuntimeException('❌ Ce besoin n\'existe pas ou est déjà entièrement couvert.');
            }

            $typeId = (int) $need['id_type'];
            $categorie = (string) ($need['categorie'] ?? '');
            if (!in_array($categorie, ['nature', 'matériaux'], true)) {
                throw new \RuntimeException('❌ Seuls les besoins en nature et en matériaux peuvent être achetés.');
            }

            $remainingNeed = $this->getNeedRemainingQty((int) $need['id_besoin']);
            if ($remainingNeed <= 0) {
                throw new \RuntimeException('❌ Ce besoin n\'existe pas ou est déjà entièrement couvert.');
            }

            if ($quantite > $remainingNeed) {
                throw new \RuntimeException(sprintf(
                    '❌ La quantité doit être entre 1 et %.2f.',
                    $remainingNeed
                ));
            }

            $donRemainingForType = $this->getRemainingDonationByType($typeId);
            if ($donRemainingForType > 0) {
                throw new \RuntimeException(sprintf(
                    '❌ Ce produit existe encore dans les dons disponibles (%.2f). Veuillez d\'abord utiliser les dons existants avant d\'effectuer un achat.',
                    $donRemainingForType
                ));
            }

            $feeRate = $this->getFeeRate();
            $montantHt = $quantite * (float) $need['prix_unitaire'];
            $montantFrais = $montantHt * ($feeRate / 100);
            $montantTtc = $montantHt + $montantFrais;

            $money = $this->getMoneySummary();
            if ($montantTtc > $money['argent_disponible']) {
                throw new \RuntimeException(sprintf(
                    '❌ Argent insuffisant. Disponible: %.2f Ar, Nécessaire: %.2f Ar (incluant %.2f%% de frais).',
                    $money['argent_disponible'],
                    $montantTtc,
                    $feeRate
                ));
            }

            $stmt = $this->db->prepare(
                'INSERT INTO achat
                (id_besoin, id_ville, id_type, nom_produit, quantite, prix_unitaire, montant_ht, taux_frais, montant_frais, montant_ttc)
                VALUES
                (:id_besoin, :id_ville, :id_type, :nom_produit, :quantite, :prix_unitaire, :montant_ht, :taux_frais, :montant_frais, :montant_ttc)'
            );

            $stmt->execute([
                ':id_besoin' => (int) $need['id_besoin'],
                ':id_ville' => (int) $need['id_ville'],
                ':id_type' => $typeId,
                ':nom_produit' => (string) $need['nom_produit'],
                ':quantite' => $quantite,
                ':prix_unitaire' => (float) $need['prix_unitaire'],
                ':montant_ht' => $montantHt,
                ':taux_frais' => $feeRate,
                ':montant_frais' => $montantFrais,
                ':montant_ttc' => $montantTtc,
            ]);

            $achatId = (int) $this->db->lastInsertId();
            $this->db->commit();

            return [
                'id_achat' => $achatId,
                'montant_ttc' => $montantTtc,
                'montant_ht' => $montantHt,
                'montant_frais' => $montantFrais,
            ];
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function updateFeeRate(float $rate): void
    {
        if ($rate < 0 || $rate > 100) {
            throw new \RuntimeException('Le taux de frais doit être entre 0 et 100.');
        }

        $sql = 'INSERT INTO configuration (cle, valeur, description)
                VALUES (:cle, :valeur, :description)
                ON DUPLICATE KEY UPDATE valeur = VALUES(valeur), description = VALUES(description)';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':cle' => 'taux_frais_achat',
            ':valeur' => number_format($rate, 2, '.', ''),
            ':description' => 'Taux de frais d achat en pourcentage (ex: 10 pour 10%)',
        ]);
    }

    public function getFeeRate(): float
    {
        $stmt = $this->db->prepare('SELECT valeur FROM configuration WHERE cle = :cle LIMIT 1');
        $stmt->execute([':cle' => 'taux_frais_achat']);
        $value = $stmt->fetchColumn();

        if ($value === false) {
            return 10.0;
        }

        return max(0.0, min(100.0, (float) $value));
    }

    public function getMoneySummary(): array
    {
        $sql = "SELECT
                    COALESCE((
                        SELECT SUM(d.quantite)
                        FROM don d
                        JOIN type_besoin tb ON tb.id_type = d.id_type
                        WHERE tb.categorie = 'argent'
                    ), 0) AS argent_total_dons,
                    COALESCE((SELECT SUM(a.montant_ttc) FROM achat a), 0) AS argent_utilise";

        $stmt = $this->db->query($sql);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC) ?: [];

        $total = (float) ($row['argent_total_dons'] ?? 0);
        $used = (float) ($row['argent_utilise'] ?? 0);

        return [
            'argent_total_dons' => $total,
            'argent_utilise' => $used,
            'argent_disponible' => $total - $used,
        ];
    }

    public function villes(): array
    {
        $stmt = $this->db->query('SELECT id_ville AS id, nom FROM ville ORDER BY nom ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function typesPurchasable(): array
    {
        $stmt = $this->db->query("SELECT id_type AS id, libelle
                                  FROM type_besoin
                                  WHERE categorie IN ('nature', 'matériaux')
                                  ORDER BY id_type ASC");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    private function getPurchasableNeeds(?int $villeId, ?int $typeId, float $feeRate, float $moneyAvailable): array
    {
        $needs = $this->getNeedRows($villeId, $typeId);
        if (empty($needs)) {
            return [];
        }

        $distributedByCityType = $this->getDistributedTotalsByCityType();
        $boughtByNeed = $this->getPurchasedTotalsByNeed();
        $remainingDonationsByType = $this->getRemainingDonationsByTypeMap();

        $rows = [];

        foreach ($needs as $need) {
            $cityTypeKey = $need['id_ville'] . '-' . $need['id_type'];
            $alreadyDistributed = (float) ($distributedByCityType[$cityTypeKey] ?? 0.0);
            $needQty = (float) $need['quantite'];

            $consumedFromDist = min($needQty, max($alreadyDistributed, 0));
            $remainingAfterDistribution = max($needQty - $consumedFromDist, 0);
            $distributedByCityType[$cityTypeKey] = max($alreadyDistributed - $consumedFromDist, 0);

            $alreadyBought = (float) ($boughtByNeed[(int) $need['id_besoin']] ?? 0.0);
            $remainingQty = max($remainingAfterDistribution - $alreadyBought, 0);

            if ($remainingQty <= 0) {
                continue;
            }

            $unitPrice = (float) $need['prix_unitaire'];
            $montantHt = $remainingQty * $unitPrice;
            $montantFrais = $montantHt * ($feeRate / 100);
            $montantTtc = $montantHt + $montantFrais;

            $remainingDonType = (float) ($remainingDonationsByType[(int) $need['id_type']] ?? 0.0);
            $achatBloque = $remainingDonType > 0;

            $rows[] = [
                'id_besoin' => (int) $need['id_besoin'],
                'id_ville' => (int) $need['id_ville'],
                'ville' => (string) $need['ville'],
                'id_type' => (int) $need['id_type'],
                'type_besoin' => (string) $need['type_besoin'],
                'nom_produit' => (string) $need['nom_produit'],
                'quantite_demandee' => $needQty,
                'quantite_recue_distribution' => $consumedFromDist,
                'quantite_recue_achat' => $alreadyBought,
                'quantite_restante' => $remainingQty,
                'prix_unitaire' => $unitPrice,
                'montant_ht' => $montantHt,
                'montant_frais' => $montantFrais,
                'montant_ttc' => $montantTtc,
                'don_restant_type' => $remainingDonType,
                'achat_bloque' => $achatBloque,
                'achat_possible_budget' => $montantTtc <= $moneyAvailable,
                'date_saisie' => (string) $need['date_saisie'],
            ];
        }

        return $rows;
    }

    private function getNeedRows(?int $villeId, ?int $typeId): array
    {
        $sql = "SELECT
                    b.id_besoin,
                    b.id_ville,
                    v.nom AS ville,
                    b.id_type,
                    tb.libelle AS type_besoin,
                    b.nom_produit,
                    b.quantite,
                    b.prix_unitaire,
                    b.date_saisie
                FROM besoin b
                JOIN ville v ON v.id_ville = b.id_ville
                JOIN type_besoin tb ON tb.id_type = b.id_type
                WHERE tb.categorie IN ('nature', 'matériaux')";

        $params = [];

        if ($villeId !== null) {
            $sql .= ' AND b.id_ville = :ville_id';
            $params[':ville_id'] = $villeId;
        }

        if ($typeId !== null) {
            $sql .= ' AND b.id_type = :type_id';
            $params[':type_id'] = $typeId;
        }

        $sql .= ' ORDER BY b.date_saisie ASC, b.id_besoin ASC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    private function getDistributedTotalsByCityType(): array
    {
        $sql = 'SELECT dist.id_ville, d.id_type, SUM(dist.quantite_attribuee) AS quantite
                FROM distribution dist
                JOIN don d ON d.id_don = dist.id_don
                GROUP BY dist.id_ville, d.id_type';

        $rows = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC) ?: [];
        $map = [];

        foreach ($rows as $row) {
            $key = (int) $row['id_ville'] . '-' . (int) $row['id_type'];
            $map[$key] = (float) $row['quantite'];
        }

        return $map;
    }

    private function getPurchasedTotalsByNeed(): array
    {
        $sql = 'SELECT id_besoin, SUM(quantite) AS quantite FROM achat GROUP BY id_besoin';
        $rows = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['id_besoin']] = (float) $row['quantite'];
        }

        return $map;
    }

    private function getRemainingDonationsByTypeMap(): array
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

        $rows = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC) ?: [];
        $map = [];

        foreach ($rows as $row) {
            $map[(int) $row['id_type']] = (float) $row['quantite_restante'];
        }

        return $map;
    }

    private function getPurchaseHistory(?int $villeId, string $periode): array
    {
        $conditions = [];
        $params = [];

        if ($villeId !== null) {
            $conditions[] = 'a.id_ville = :ville_id';
            $params[':ville_id'] = $villeId;
        }

        $periodeSql = $this->buildPeriodCondition($periode, $params);
        if ($periodeSql !== '') {
            $conditions[] = $periodeSql;
        }

        $where = empty($conditions) ? '' : ('WHERE ' . implode(' AND ', $conditions));

        $sqlRows = "SELECT
                        a.id_achat,
                        a.date_achat,
                        v.nom AS ville,
                        tb.libelle AS type_besoin,
                        a.nom_produit,
                        a.quantite,
                        a.prix_unitaire,
                        a.montant_ht,
                        a.taux_frais,
                        a.montant_frais,
                        a.montant_ttc
                    FROM achat a
                    JOIN ville v ON v.id_ville = a.id_ville
                    JOIN type_besoin tb ON tb.id_type = a.id_type
                    {$where}
                    ORDER BY a.date_achat DESC, a.id_achat DESC";

        $stmtRows = $this->db->prepare($sqlRows);
        $stmtRows->execute($params);
        $rows = $stmtRows->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        $sqlSummary = "SELECT
                           COALESCE(SUM(a.montant_ht), 0) AS total_ht,
                           COALESCE(SUM(a.montant_frais), 0) AS total_frais,
                           COALESCE(SUM(a.montant_ttc), 0) AS total_ttc,
                           COUNT(a.id_achat) AS nb_achats
                       FROM achat a
                       {$where}";

        $stmtSummary = $this->db->prepare($sqlSummary);
        $stmtSummary->execute($params);
        $summaryRow = $stmtSummary->fetch(\PDO::FETCH_ASSOC) ?: [];

        return [
            'rows' => $rows,
            'summary' => [
                'total_ht' => (float) ($summaryRow['total_ht'] ?? 0),
                'total_frais' => (float) ($summaryRow['total_frais'] ?? 0),
                'total_ttc' => (float) ($summaryRow['total_ttc'] ?? 0),
                'nb_achats' => (int) ($summaryRow['nb_achats'] ?? 0),
            ],
        ];
    }

    private function buildPeriodCondition(string $periode, array &$params): string
    {
        $today = new \DateTimeImmutable('today');

        switch ($periode) {
            case 'month':
                $params[':date_from'] = $today->modify('first day of this month')->format('Y-m-d 00:00:00');
                return 'a.date_achat >= :date_from';
            case '7days':
                $params[':date_from'] = $today->modify('-7 days')->format('Y-m-d 00:00:00');
                return 'a.date_achat >= :date_from';
            case '30days':
                $params[':date_from'] = $today->modify('-30 days')->format('Y-m-d 00:00:00');
                return 'a.date_achat >= :date_from';
            default:
                return '';
        }
    }

    private function getNeedForUpdate(int $needId): ?array
    {
        $stmt = $this->db->prepare('SELECT b.*, tb.categorie
                                    FROM besoin b
                                    JOIN type_besoin tb ON tb.id_type = b.id_type
                                    WHERE b.id_besoin = :id
                                    LIMIT 1
                                    FOR UPDATE');
        $stmt->execute([':id' => $needId]);

        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }

        return $row;
    }

    private function getNeedRemainingQty(int $needId): float
    {
        $needStmt = $this->db->prepare('SELECT id_ville, id_type, quantite, date_saisie, id_besoin FROM besoin WHERE id_besoin = :id LIMIT 1');
        $needStmt->execute([':id' => $needId]);
        $need = $needStmt->fetch(\PDO::FETCH_ASSOC);
        if (!$need) {
            return 0.0;
        }

        $cityId = (int) $need['id_ville'];
        $typeId = (int) $need['id_type'];

        $allStmt = $this->db->prepare('SELECT id_besoin, quantite
                                      FROM besoin
                                      WHERE id_ville = :id_ville AND id_type = :id_type
                                      ORDER BY date_saisie ASC, id_besoin ASC');
        $allStmt->execute([
            ':id_ville' => $cityId,
            ':id_type' => $typeId,
        ]);
        $needRows = $allStmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        $distStmt = $this->db->prepare('SELECT COALESCE(SUM(dist.quantite_attribuee), 0)
                                       FROM distribution dist
                                       JOIN don d ON d.id_don = dist.id_don
                                       WHERE dist.id_ville = :id_ville AND d.id_type = :id_type');
        $distStmt->execute([
            ':id_ville' => $cityId,
            ':id_type' => $typeId,
        ]);
        $distributed = (float) $distStmt->fetchColumn();

        $remainingForTarget = 0.0;
        foreach ($needRows as $row) {
            $needQty = (float) $row['quantite'];
            $consumed = min($needQty, max($distributed, 0));
            $afterDist = max($needQty - $consumed, 0);
            $distributed = max($distributed - $consumed, 0);

            $achatStmt = $this->db->prepare('SELECT COALESCE(SUM(quantite), 0) FROM achat WHERE id_besoin = :id_besoin');
            $achatStmt->execute([':id_besoin' => (int) $row['id_besoin']]);
            $alreadyBought = (float) $achatStmt->fetchColumn();

            $remaining = max($afterDist - $alreadyBought, 0);
            if ((int) $row['id_besoin'] === $needId) {
                $remainingForTarget = $remaining;
                break;
            }
        }

        return $remainingForTarget;
    }

    private function getRemainingDonationByType(int $typeId): float
    {
        $sql = "SELECT COALESCE(SUM(GREATEST(d.quantite - COALESCE(x.distributed_qty, 0), 0)), 0)
                FROM don d
                LEFT JOIN (
                    SELECT id_don, SUM(quantite_attribuee) AS distributed_qty
                    FROM distribution
                    GROUP BY id_don
                ) x ON x.id_don = d.id_don
                WHERE d.id_type = :id_type";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id_type' => $typeId]);

        return (float) $stmt->fetchColumn();
    }
}
