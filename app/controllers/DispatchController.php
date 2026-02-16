<?php

namespace app\controllers;

use app\models\DispatchModel;
use Exception;
use Flight;

class DispatchController
{
    public static function index(): void
    {
        Flight::render('dispatch');
    }

    public static function simulate(): void
    {
        try {
            $dons = DispatchModel::getAvailableDonStates();
            $draftRows = [];
            $eligibleCitiesByType = [];
            $draftNeedRemainings = [];
            $needsByType = [];
            $lineIndex = 1;

            foreach ($dons as $don) {
                $idType = (int) $don['id_type'];
                $remainingDon = (float) $don['quantite_restante'];
                if ($remainingDon <= 0) {
                    continue;
                }

                if (!isset($needsByType[$idType])) {
                    $needsByType[$idType] = DispatchModel::getUnsatisfiedNeedsByType($idType);
                }

                foreach ($needsByType[$idType] as &$need) {
                    if ($remainingDon <= 0) {
                        break;
                    }

                    $remainingNeed = (float) $need['quantite_restante'];
                    if ($remainingNeed <= 0) {
                        continue;
                    }

                    $quantityToDistribute = min($remainingDon, $remainingNeed);
                    if ($quantityToDistribute <= 0) {
                        continue;
                    }

                    $draftRows[] = [
                        'line_id' => 'line-' . $lineIndex,
                        'id_don' => (int) $don['id_don'],
                        'id_type' => $idType,
                        'type_besoin' => $don['type_besoin'],
                        'id_ville' => (int) $need['id_ville'],
                        'ville' => $need['ville'],
                        'id_besoin' => (int) $need['id_besoin'],
                        'quantite_proposee' => (float) $quantityToDistribute,
                        'quantite_max_initiale' => (float) $quantityToDistribute,
                        'don_quantite_totale' => (float) $don['quantite_totale'],
                        'don_quantite_restante_avant' => (float) $don['quantite_restante'],
                        'don_label' => sprintf(
                            'Don #%d (%.2f %s)',
                            (int) $don['id_don'],
                            (float) $don['quantite_totale'],
                            $don['type_besoin']
                        ),
                    ];

                    $lineIndex++;
                    $remainingDon -= $quantityToDistribute;
                    $need['quantite_restante'] -= $quantityToDistribute;
                }
                unset($need);

                if (!isset($eligibleCitiesByType[$idType])) {
                    $eligibleCitiesByType[$idType] = DispatchModel::getEligibleCitiesByType($idType);
                }
            }

            foreach ($eligibleCitiesByType as $typeId => $cities) {
                foreach ($cities as $city) {
                    $draftNeedRemainings[$city['id_ville'] . '-' . $typeId] = (float) $city['besoin_restant'];
                }
            }

            $summary = self::buildSummary($draftRows, $dons);

            self::json([
                'success' => true,
                'message' => empty($draftRows) ? 'Aucune distribution possible.' : 'Simulation générée en brouillon.',
                'data' => [
                    'distributions' => $draftRows,
                    'eligible_cities_by_type' => $eligibleCitiesByType,
                    'need_remainings' => $draftNeedRemainings,
                    'summary' => $summary,
                ],
            ]);
        } catch (Exception $e) {
            self::json([
                'success' => false,
                'message' => 'Erreur pendant la simulation: ' . $e->getMessage(),
            ], 500);
        }
    }

    public static function eligibleCities(string $idType): void
    {
        try {
            $typeId = (int) $idType;
            if ($typeId <= 0) {
                self::json(['success' => false, 'message' => 'Type invalide.'], 422);
                return;
            }

            $cities = DispatchModel::getEligibleCitiesByType($typeId);
            self::json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (Exception $e) {
            self::json([
                'success' => false,
                'message' => 'Erreur lors du chargement des villes éligibles: ' . $e->getMessage(),
            ], 500);
        }
    }

    public static function validateDraft(): void
    {
        $payload = json_decode(file_get_contents('php://input'), true);
        $rows = $payload['distributions'] ?? [];

        if (!is_array($rows) || empty($rows)) {
            self::json([
                'success' => false,
                'message' => 'Aucune distribution à valider.',
            ], 422);
            return;
        }

        $normalizedRows = [];
        foreach ($rows as $index => $row) {
            $idDon = (int) ($row['id_don'] ?? 0);
            $idVille = (int) ($row['id_ville'] ?? 0);
            $idType = (int) ($row['id_type'] ?? 0);
            $quantity = (float) ($row['quantite_proposee'] ?? 0);

            if ($idDon <= 0 || $idVille <= 0 || $idType <= 0) {
                self::json([
                    'success' => false,
                    'message' => 'Ligne invalide (don, ville ou type manquant).',
                    'line_index' => $index,
                ], 422);
                return;
            }

            if ($quantity < 0) {
                self::json([
                    'success' => false,
                    'message' => 'La quantité ne peut pas être négative.',
                    'line_index' => $index,
                ], 422);
                return;
            }

            if ($quantity == 0.0) {
                continue;
            }

            $normalizedRows[] = [
                'id_don' => $idDon,
                'id_ville' => $idVille,
                'id_type' => $idType,
                'quantite_proposee' => $quantity,
            ];
        }

        if (empty($normalizedRows)) {
            self::json([
                'success' => false,
                'message' => 'Toutes les lignes sont à 0. Rien à enregistrer.',
            ], 422);
            return;
        }

        try {
            $donIds = array_values(array_unique(array_map(static fn($row) => $row['id_don'], $normalizedRows)));
            $donMap = DispatchModel::getDonRemainingsByIds($donIds);

            $cityTypePairs = [];
            foreach ($normalizedRows as $row) {
                $key = $row['id_ville'] . '-' . $row['id_type'];
                $cityTypePairs[$key] = [
                    'id_ville' => $row['id_ville'],
                    'id_type' => $row['id_type'],
                ];
            }
            $needMap = DispatchModel::getCityTypeRemainings(array_values($cityTypePairs));

            $donBudget = [];
            foreach ($donMap as $idDon => $state) {
                $donBudget[$idDon] = (float) $state['quantite_restante'];
            }

            $needBudget = $needMap;

            foreach ($normalizedRows as $index => $row) {
                $idDon = $row['id_don'];
                $idVille = $row['id_ville'];
                $idType = $row['id_type'];
                $quantity = $row['quantite_proposee'];

                if (!isset($donMap[$idDon])) {
                    self::json([
                        'success' => false,
                        'message' => sprintf('Don #%d introuvable.', $idDon),
                        'line_index' => $index,
                    ], 422);
                    return;
                }

                if ((int) $donMap[$idDon]['id_type'] !== $idType) {
                    self::json([
                        'success' => false,
                        'message' => sprintf('Le don #%d ne correspond pas au type demandé.', $idDon),
                        'line_index' => $index,
                    ], 422);
                    return;
                }

                if (($donBudget[$idDon] ?? 0) < $quantity) {
                    self::json([
                        'success' => false,
                        'message' => sprintf('Quantité insuffisante pour le don #%d.', $idDon),
                        'line_index' => $index,
                    ], 422);
                    return;
                }

                $needKey = $idVille . '-' . $idType;
                if (!isset($needBudget[$needKey])) {
                    self::json([
                        'success' => false,
                        'message' => 'La ville sélectionnée n\'a plus de besoin pour ce type.',
                        'line_index' => $index,
                    ], 422);
                    return;
                }

                if ($needBudget[$needKey] < $quantity) {
                    self::json([
                        'success' => false,
                        'message' => 'Quantité supérieure au besoin restant de la ville.',
                        'line_index' => $index,
                    ], 422);
                    return;
                }

                $donBudget[$idDon] -= $quantity;
                $needBudget[$needKey] -= $quantity;
            }

            DispatchModel::beginTransaction();
            foreach ($normalizedRows as $row) {
                DispatchModel::createDistribution(
                    $row['id_don'],
                    $row['id_ville'],
                    $row['quantite_proposee']
                );
            }
            DispatchModel::commit();

            self::json([
                'success' => true,
                'message' => 'Dispatch validé avec succès.',
                'data' => [
                    'distribution_count' => count($normalizedRows),
                    'total_quantity' => array_sum(array_column($normalizedRows, 'quantite_proposee')),
                ],
            ]);
        } catch (Exception $e) {
            DispatchModel::rollback();
            self::json([
                'success' => false,
                'message' => 'Erreur lors de la validation: ' . $e->getMessage(),
            ], 500);
        }
    }

    private static function buildSummary(array $draftRows, array $dons): array
    {
        $totalQuantity = 0.0;
        $donDistributed = [];

        foreach ($draftRows as $row) {
            $quantity = (float) $row['quantite_proposee'];
            $idDon = (int) $row['id_don'];
            $totalQuantity += $quantity;

            if (!isset($donDistributed[$idDon])) {
                $donDistributed[$idDon] = 0.0;
            }
            $donDistributed[$idDon] += $quantity;
        }

        $donState = [];
        foreach ($dons as $don) {
            $idDon = (int) $don['id_don'];
            $distributed = $donDistributed[$idDon] ?? 0.0;
            $total = (float) $don['quantite_totale'];
            $remaining = max($total - $distributed, 0);
            $percent = $total > 0 ? round(($distributed / $total) * 100, 2) : 0;

            $donState[] = [
                'id_don' => $idDon,
                'type_besoin' => $don['type_besoin'],
                'quantite_totale' => $total,
                'quantite_distribuee' => $distributed,
                'quantite_restante' => $remaining,
                'completion_percent' => $percent,
            ];
        }

        return [
            'distribution_count' => count($draftRows),
            'don_count' => count(array_unique(array_column($draftRows, 'id_don'))),
            'total_quantity' => $totalQuantity,
            'dons' => $donState,
        ];
    }

    private static function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
