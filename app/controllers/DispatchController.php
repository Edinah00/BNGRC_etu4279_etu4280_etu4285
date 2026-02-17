<?php

namespace app\controllers;

use app\models\DispatchModel;
use Exception;
use Flight;

class DispatchController
{
    public function index(): void
    {
        Flight::render('dispatch');
    }

    public function simulate(): void
    {
        $mode = $this->sanitizeMode((string) ($_GET['mode_dispatch'] ?? 'fifo'));

        try {
            $model = new DispatchModel();

            if ($mode === 'proportionnel') {
                $data = $this->simulateProportionnel($model);
            } elseif ($mode === 'priorite_petits') {
                $data = $this->simulatePrioritePetits($model);
            } else {
                $data = $this->simulateFifo($model);
            }

            $this->json([
                'success' => true,
                'message' => empty($data['distributions']) ? 'Aucune distribution possible.' : 'Simulation générée en brouillon.',
                'data' => $data,
            ]);
        } catch (Exception $e) {
            $this->json([
                'success' => false,
                'message' => 'Erreur pendant la simulation: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function eligibleCities(string $idType): void
    {
        try {
            $typeId = (int) $idType;
            if ($typeId <= 0) {
                $this->json(['success' => false, 'message' => 'Type invalide.'], 422);
                return;
            }

            $model = new DispatchModel();
            $cities = $model->getVillesEligibles($typeId);

            $this->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (Exception $e) {
            $this->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des villes éligibles: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function validateDraft(): void
    {
        $payload = Flight::request()->data->getData();
        if (!is_array($payload) || empty($payload)) {
            $decoded = json_decode(file_get_contents('php://input'), true);
            $payload = is_array($decoded) ? $decoded : $_POST;
        }

        $mode = $this->sanitizeMode((string) ($payload['mode_dispatch'] ?? 'fifo'));
        $rows = $payload['distributions'] ?? [];

        if (!is_array($rows) || empty($rows)) {
            $this->json([
                'success' => false,
                'message' => 'Aucune distribution à valider.',
            ], 422);
            return;
        }

        try {
            $model = new DispatchModel();

            if ($mode === 'fifo') {
                $result = $this->validateFifo($model, $rows);
            } else {
                $result = $this->validateNeedsBasedMode($model, $rows, $mode);
            }

            $this->json([
                'success' => true,
                'message' => $this->successMessageByMode($mode),
                'data' => $result,
            ]);
        } catch (\RuntimeException $e) {
            if (isset($model)) {
                $model->rollback();
            }
            $this->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Exception $e) {
            if (isset($model)) {
                $model->rollback();
            }
            $this->json([
                'success' => false,
                'message' => 'Erreur lors de la validation: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function resetData(): void
    {
        try {
            $model = new DispatchModel();
            $model->resetBesoinsEtDons();

            $this->json([
                'success' => true,
                'message' => 'Besoins et dons réinitialisés avec succès.',
            ]);
        } catch (\RuntimeException $e) {
            $this->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Exception $e) {
            $this->json([
                'success' => false,
                'message' => 'Erreur pendant la réinitialisation: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function simulateFifo(DispatchModel $model): array
    {
        $dons = $model->getDonsDisponibles();
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
                $needsByType[$idType] = $model->getBesoinsNonSatisfaits($idType);
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
                    'type_besoin' => (string) $don['type_besoin'],
                    'id_ville' => (int) $need['id_ville'],
                    'ville' => (string) $need['ville'],
                    'id_besoin' => (int) $need['id_besoin'],
                    'quantite_proposee' => (float) $quantityToDistribute,
                    'quantite_max_initiale' => (float) $quantityToDistribute,
                    'don_quantite_totale' => (float) $don['quantite_totale'],
                    'don_quantite_utilisee' => (float) ($don['quantite_utilisee'] ?? 0),
                    'don_quantite_restante_avant' => (float) $don['quantite_restante'],
                    'besoin_quantite_demandee' => (float) ($need['quantite_demandee'] ?? 0),
                    'besoin_quantite_satisfaite' => (float) ($need['quantite_satisfaite'] ?? 0),
                    'don_label' => sprintf(
                        'Don #%d (%.2f %s)',
                        (int) $don['id_don'],
                        (float) $don['quantite_totale'],
                        (string) $don['type_besoin']
                    ),
                ];

                $lineIndex++;
                $remainingDon -= $quantityToDistribute;
                $need['quantite_restante'] -= $quantityToDistribute;
                $need['quantite_satisfaite'] = (float) ($need['quantite_satisfaite'] ?? 0) + $quantityToDistribute;
            }
            unset($need);

            if (!isset($eligibleCitiesByType[$idType])) {
                $eligibleCitiesByType[$idType] = $model->getVillesEligibles($idType);
            }
        }

        foreach ($eligibleCitiesByType as $typeId => $cities) {
            foreach ($cities as $city) {
                $draftNeedRemainings[$city['id_ville'] . '-' . $typeId] = (float) $city['besoin_restant'];
            }
        }

        return [
            'mode_dispatch' => 'fifo',
            'distributions' => $draftRows,
            'eligible_cities_by_type' => $eligibleCitiesByType,
            'need_remainings' => $draftNeedRemainings,
            'summary' => $this->buildSummary($draftRows, $dons, 'fifo'),
        ];
    }

    private function simulateProportionnel(DispatchModel $model): array
    {
        $typeLabels = $model->getTypeLabelsMap();
        $remainingDonByType = $model->getRemainingDonByTypeMap();

        $draftRows = [];
        $summaryTypes = [];

        foreach ($remainingDonByType as $idType => $donDisponibleRaw) {
            $donDisponible = (int) floor($donDisponibleRaw);
            if ($idType <= 0 || $donDisponible <= 0) {
                continue;
            }

            $needs = $model->getBesoinsNonSatisfaits($idType);
            if (empty($needs)) {
                continue;
            }

            $propositions = [];
            $totalBesoins = 0;

            foreach ($needs as $need) {
                $besoinRestant = (int) floor((float) ($need['quantite_restante'] ?? 0));
                if ($besoinRestant <= 0) {
                    continue;
                }

                $propositions[] = [
                    'id_besoin' => (int) $need['id_besoin'],
                    'id_ville' => (int) $need['id_ville'],
                    'ville' => (string) $need['ville'],
                    'nom_produit' => (string) $need['nom_produit'],
                    'date_saisie' => (string) $need['date_saisie'],
                    'besoin_restant' => $besoinRestant,
                    'allocation' => 0,
                ];
                $totalBesoins += $besoinRestant;
            }

            if ($totalBesoins <= 0 || empty($propositions)) {
                continue;
            }

            $ratio = $donDisponible / $totalBesoins;
            $totalAlloue = 0;

            foreach ($propositions as &$proposition) {
                $brut = (float) $proposition['besoin_restant'] * $ratio;
                $allocation = (int) floor($brut);
                $allocation = min($allocation, (int) $proposition['besoin_restant']); // cap ratio > 100%
                $proposition['allocation'] = $allocation;
                $proposition['decimale'] = $brut - floor($brut);
                $totalAlloue += $allocation;
            }
            unset($proposition);

            $reste = $donDisponible - $totalAlloue;

            if ($reste > 0) {
                usort($propositions, function ($a, $b) {
                    if (abs((float) $a['decimale'] - (float) $b['decimale']) < 0.0001) {
                        $dateCmp = strtotime($a['date_saisie']) <=> strtotime($b['date_saisie']);
                        if ($dateCmp !== 0) {
                            return $dateCmp;
                        }
                        return $a['id_besoin'] <=> $b['id_besoin'];
                    }
                    return ((float) $b['decimale']) <=> ((float) $a['decimale']);
                });

                // Distribute one-by-one in decimal priority order.
                while ($reste > 0) {
                    $progress = false;
                    foreach ($propositions as &$proposition) {
                        if ($reste <= 0) {
                            break;
                        }

                        $capacite = $proposition['besoin_restant'] - $proposition['allocation'];
                        if ($capacite <= 0) {
                            continue;
                        }

                        $proposition['allocation'] += 1;
                        $reste -= 1;
                        $progress = true;
                    }
                    unset($proposition);

                    if (!$progress) {
                        // No capacity left on any need -> keep surplus.
                        break;
                    }
                }
            }

            foreach ($propositions as &$proposition) {
                unset($proposition['decimale']);
            }
            unset($proposition);

            usort($propositions, function ($a, $b) {
                $cityCmp = strcmp($a['ville'], $b['ville']);
                if ($cityCmp !== 0) {
                    return $cityCmp;
                }
                $dateCmp = strtotime($a['date_saisie']) <=> strtotime($b['date_saisie']);
                if ($dateCmp !== 0) {
                    return $dateCmp;
                }
                return $a['id_besoin'] <=> $b['id_besoin'];
            });

            $typeAllocated = 0;
            foreach ($propositions as $proposition) {
                $allocation = (int) $proposition['allocation'];
                $besoinRestant = (int) $proposition['besoin_restant'];

                $draftRows[] = [
                    'id_type' => (int) $idType,
                    'type_besoin' => (string) ($typeLabels[$idType] ?? ('Type #' . $idType)),
                    'id_besoin' => (int) $proposition['id_besoin'],
                    'id_ville' => (int) $proposition['id_ville'],
                    'ville' => (string) $proposition['ville'],
                    'nom_produit' => (string) $proposition['nom_produit'],
                    'date_saisie' => (string) $proposition['date_saisie'],
                    'besoin_restant' => $besoinRestant,
                    'quantite_proposee' => $allocation,
                    'quantite_initiale' => $allocation,
                    'pourcentage' => $besoinRestant > 0 ? round(($allocation / $besoinRestant) * 100, 1) : 0,
                    'modifiable' => true,
                ];

                $typeAllocated += $allocation;
            }

            $summaryTypes[] = [
                'id_type' => (int) $idType,
                'type_besoin' => (string) ($typeLabels[$idType] ?? ('Type #' . $idType)),
                'don_disponible' => $donDisponible,
                'besoin_total' => $totalBesoins,
                'ratio_pct' => round($ratio * 100, 2),
                'total_alloue' => $typeAllocated,
                'surplus' => max($donDisponible - $typeAllocated, 0),
            ];
        }

        $totalQuantity = 0;
        foreach ($draftRows as $row) {
            $totalQuantity += (float) $row['quantite_proposee'];
        }

        return [
            'mode_dispatch' => 'proportionnel',
            'distributions' => $draftRows,
            'eligible_cities_by_type' => [],
            'need_remainings' => [],
            'summary' => [
                'mode_dispatch' => 'proportionnel',
                'distribution_count' => count($draftRows),
                'type_count' => count($summaryTypes),
                'total_quantity' => $totalQuantity,
                'types' => $summaryTypes,
            ],
        ];
    }

    private function simulatePrioritePetits(DispatchModel $model): array
    {
        $typeLabels = $model->getTypeLabelsMap();
        $remainingDonByType = $model->getRemainingDonByTypeMap();

        $draftRows = [];
        $summaryTypes = [];

        foreach ($remainingDonByType as $idType => $donDisponibleRaw) {
            $donDisponible = (int) floor($donDisponibleRaw);
            if ($idType <= 0 || $donDisponible <= 0) {
                continue;
            }

            $needs = $model->getBesoinsNonSatisfaits($idType);
            if (empty($needs)) {
                continue;
            }

            $propositions = [];
            foreach ($needs as $need) {
                $besoinRestant = (int) floor((float) ($need['quantite_restante'] ?? 0));
                if ($besoinRestant <= 0) {
                    continue;
                }

                $propositions[] = [
                    'id_besoin' => (int) $need['id_besoin'],
                    'id_ville' => (int) $need['id_ville'],
                    'ville' => (string) $need['ville'],
                    'nom_produit' => (string) $need['nom_produit'],
                    'date_saisie' => (string) $need['date_saisie'],
                    'besoin_restant' => $besoinRestant,
                ];
            }

            if (empty($propositions)) {
                continue;
            }

            usort($propositions, function ($a, $b) {
                if ($a['besoin_restant'] === $b['besoin_restant']) {
                    $dateCmp = strtotime($a['date_saisie']) <=> strtotime($b['date_saisie']);
                    if ($dateCmp !== 0) {
                        return $dateCmp;
                    }
                    return $a['id_besoin'] <=> $b['id_besoin'];
                }
                return $a['besoin_restant'] <=> $b['besoin_restant'];
            });

            $resteDon = $donDisponible;
            $totalAlloue = 0;
            $totalBesoin = 0;
            $countSatisfait = 0;
            $countPartiel = 0;
            $countZero = 0;

            foreach ($propositions as $proposition) {
                $besoinRestant = (int) $proposition['besoin_restant'];
                $totalBesoin += $besoinRestant;

                if ($resteDon >= $besoinRestant) {
                    $allocation = $besoinRestant;
                } elseif ($resteDon > 0) {
                    $allocation = $resteDon;
                } else {
                    $allocation = 0;
                }

                $resteDon -= $allocation;
                $totalAlloue += $allocation;

                $satisfait = $allocation >= $besoinRestant;
                $status = $satisfait ? 'satisfait' : ($allocation > 0 ? 'partiel' : 'zero');

                if ($status === 'satisfait') {
                    $countSatisfait++;
                } elseif ($status === 'partiel') {
                    $countPartiel++;
                } else {
                    $countZero++;
                }

                $draftRows[] = [
                    'id_type' => (int) $idType,
                    'type_besoin' => (string) ($typeLabels[$idType] ?? ('Type #' . $idType)),
                    'id_besoin' => (int) $proposition['id_besoin'],
                    'id_ville' => (int) $proposition['id_ville'],
                    'ville' => (string) $proposition['ville'],
                    'nom_produit' => (string) $proposition['nom_produit'],
                    'date_saisie' => (string) $proposition['date_saisie'],
                    'besoin_restant' => $besoinRestant,
                    'quantite_proposee' => $allocation,
                    'quantite_initiale' => $allocation,
                    'satisfait' => $satisfait,
                    'status' => $status,
                    'pourcentage' => $besoinRestant > 0 ? round(($allocation / $besoinRestant) * 100, 1) : 0,
                    'modifiable' => true,
                ];
            }

            $summaryTypes[] = [
                'id_type' => (int) $idType,
                'type_besoin' => (string) ($typeLabels[$idType] ?? ('Type #' . $idType)),
                'don_disponible' => $donDisponible,
                'besoin_total' => $totalBesoin,
                'total_alloue' => $totalAlloue,
                'surplus' => max($resteDon, 0),
                'nb_satisfaits' => $countSatisfait,
                'nb_partiels' => $countPartiel,
                'nb_zero' => $countZero,
            ];
        }

        $totalQuantity = 0;
        foreach ($draftRows as $row) {
            $totalQuantity += (float) $row['quantite_proposee'];
        }

        return [
            'mode_dispatch' => 'priorite_petits',
            'distributions' => $draftRows,
            'eligible_cities_by_type' => [],
            'need_remainings' => [],
            'summary' => [
                'mode_dispatch' => 'priorite_petits',
                'distribution_count' => count($draftRows),
                'type_count' => count($summaryTypes),
                'total_quantity' => $totalQuantity,
                'types' => $summaryTypes,
            ],
        ];
    }

    private function validateFifo(DispatchModel $model, array $rows): array
    {
        $normalizedRows = [];

        foreach ($rows as $row) {
            $idDon = (int) ($row['id_don'] ?? 0);
            $idVille = (int) ($row['id_ville'] ?? 0);
            $idType = (int) ($row['id_type'] ?? 0);
            $quantity = (float) ($row['quantite_proposee'] ?? 0);

            if ($idDon <= 0 || $idVille <= 0 || $idType <= 0) {
                throw new \RuntimeException('Ligne invalide (don, ville ou type manquant).');
            }
            if ($quantity < 0) {
                throw new \RuntimeException('La quantité ne peut pas être négative.');
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
            throw new \RuntimeException('Toutes les lignes sont à 0. Rien à enregistrer.');
        }

        $donIds = array_values(array_unique(array_map(static fn($row) => $row['id_don'], $normalizedRows)));
        $donMap = $model->getDonRemainingsByIds($donIds);

        $cityTypePairs = [];
        foreach ($normalizedRows as $row) {
            $key = $row['id_ville'] . '-' . $row['id_type'];
            $cityTypePairs[$key] = [
                'id_ville' => $row['id_ville'],
                'id_type' => $row['id_type'],
            ];
        }

        $needMap = $model->getCityTypeRemainings(array_values($cityTypePairs));

        $donBudget = [];
        foreach ($donMap as $idDon => $state) {
            $donBudget[$idDon] = (float) $state['quantite_restante'];
        }
        $needBudget = $needMap;

        foreach ($normalizedRows as $row) {
            $idDon = $row['id_don'];
            $idVille = $row['id_ville'];
            $idType = $row['id_type'];
            $quantity = $row['quantite_proposee'];

            if (!isset($donMap[$idDon])) {
                throw new \RuntimeException(sprintf('Don #%d introuvable.', $idDon));
            }
            if ((int) $donMap[$idDon]['id_type'] !== $idType) {
                throw new \RuntimeException(sprintf('Le don #%d ne correspond pas au type demandé.', $idDon));
            }
            if (($donBudget[$idDon] ?? 0) < $quantity) {
                throw new \RuntimeException(sprintf('Quantité insuffisante pour le don #%d.', $idDon));
            }

            $needKey = $idVille . '-' . $idType;
            if (!isset($needBudget[$needKey])) {
                throw new \RuntimeException('La ville sélectionnée n\'a plus de besoin pour ce type.');
            }
            if ($needBudget[$needKey] < $quantity) {
                throw new \RuntimeException('Quantité supérieure au besoin restant de la ville.');
            }

            $donBudget[$idDon] -= $quantity;
            $needBudget[$needKey] -= $quantity;
        }

        $model->beginTransaction();
        foreach ($normalizedRows as $row) {
            $model->createDistribution(
                $row['id_don'],
                $row['id_ville'],
                $row['id_type'],
                $row['quantite_proposee'],
                'fifo'
            );
        }
        $model->commit();

        return [
            'mode_dispatch' => 'fifo',
            'distribution_count' => count($normalizedRows),
            'total_quantity' => array_sum(array_column($normalizedRows, 'quantite_proposee')),
        ];
    }

    private function validateNeedsBasedMode(DispatchModel $model, array $rows, string $modeDispatch): array
    {
        $normalizedRows = [];
        $typeTotals = [];
        $besoinTotals = [];
        $types = [];

        foreach ($rows as $row) {
            $idType = (int) ($row['id_type'] ?? 0);
            $idVille = (int) ($row['id_ville'] ?? 0);
            $idBesoin = (int) ($row['id_besoin'] ?? 0);
            $quantityRaw = (float) ($row['quantite_proposee'] ?? 0);
            $quantity = (int) floor($quantityRaw);
            $snapshotBesoinRestant = (int) floor((float) ($row['besoin_restant'] ?? 0));

            if ($idType <= 0 || $idVille <= 0 || $idBesoin <= 0) {
                throw new \RuntimeException('Ligne invalide (type, ville ou besoin manquant).');
            }
            if ($quantityRaw < 0) {
                throw new \RuntimeException('La quantité ne peut pas être négative.');
            }
            if (abs($quantityRaw - $quantity) > 0.00001) {
                throw new \RuntimeException('Ce mode accepte uniquement des entiers.');
            }

            $normalizedRows[] = [
                'id_type' => $idType,
                'id_ville' => $idVille,
                'id_besoin' => $idBesoin,
                'quantite_proposee' => $quantity,
                'besoin_restant' => $snapshotBesoinRestant,
            ];

            $typeTotals[$idType] = ($typeTotals[$idType] ?? 0) + $quantity;
            $besoinTotals[$idBesoin] = ($besoinTotals[$idBesoin] ?? 0) + $quantity;
            $types[$idType] = true;
        }

        if (empty($normalizedRows) || array_sum($typeTotals) <= 0) {
            throw new \RuntimeException('Toutes les lignes sont à 0. Rien à enregistrer.');
        }

        $needsByBesoinId = [];
        foreach (array_keys($types) as $idType) {
            $needs = $model->getBesoinsNonSatisfaits((int) $idType);
            foreach ($needs as $need) {
                $needsByBesoinId[(int) $need['id_besoin']] = [
                    'id_type' => (int) $need['id_type'],
                    'id_ville' => (int) $need['id_ville'],
                    'quantite_restante' => (int) floor((float) $need['quantite_restante']),
                ];
            }
        }

        foreach ($normalizedRows as $row) {
            $idBesoin = $row['id_besoin'];
            $quantity = $row['quantite_proposee'];

            if (!isset($needsByBesoinId[$idBesoin])) {
                throw new \RuntimeException('Le besoin sélectionné n\'est plus disponible. Relancez la simulation.');
            }

            $needState = $needsByBesoinId[$idBesoin];
            if ($needState['id_type'] !== $row['id_type'] || $needState['id_ville'] !== $row['id_ville']) {
                throw new \RuntimeException('Incohérence détectée entre besoin, type et ville.');
            }

            // Priorité au snapshot de simulation: si l'utilisateur ne modifie rien,
            // la validation doit rester cohérente avec ce qui a été simulé.
            if ($row['besoin_restant'] > 0 && $quantity > $row['besoin_restant']) {
                throw new \RuntimeException('Quantité supérieure au besoin simulé.');
            }
        }

        foreach ($besoinTotals as $idBesoin => $totalBesoin) {
            $snapshot = 0;
            foreach ($normalizedRows as $row) {
                if ((int) $row['id_besoin'] === (int) $idBesoin) {
                    $snapshot = max($snapshot, (int) $row['besoin_restant']);
                }
            }
            if ($snapshot > 0 && $totalBesoin > $snapshot) {
                throw new \RuntimeException('Quantité totale supérieure au besoin simulé pour une ligne.');
            }
        }

        $remainingDonByType = $model->getRemainingDonByTypeMap();
        foreach ($typeTotals as $idType => $total) {
            $disponible = (int) floor((float) ($remainingDonByType[$idType] ?? 0));
            if ($total > $disponible) {
                throw new \RuntimeException('Quantité totale supérieure au don disponible pour un type.');
            }
        }

        $model->beginTransaction();
        $distributionCount = 0;
        $totalQuantity = 0;

        foreach ($typeTotals as $idType => $totalForType) {
            if ($totalForType <= 0) {
                continue;
            }

            $dons = $model->getAvailableDonsByType((int) $idType);
            if (empty($dons)) {
                throw new \RuntimeException('Aucun don disponible pour un type lors de la validation.');
            }

            foreach ($normalizedRows as $row) {
                if ($row['id_type'] !== (int) $idType) {
                    continue;
                }

                $aDistribuer = (int) $row['quantite_proposee'];
                if ($aDistribuer <= 0) {
                    continue;
                }

                foreach ($dons as &$don) {
                    if ($aDistribuer <= 0) {
                        break;
                    }
                    if ((float) $don['restant'] <= 0) {
                        continue;
                    }

                    $quantite = min($aDistribuer, (int) floor((float) $don['restant']));
                    if ($quantite <= 0) {
                        continue;
                    }

                    $model->createDistribution(
                        (int) $don['id_don'],
                        (int) $row['id_ville'],
                        (int) $row['id_type'],
                        (float) $quantite,
                        $modeDispatch
                    );

                    $don['restant'] = (float) $don['restant'] - $quantite;
                    $aDistribuer -= $quantite;
                    $distributionCount++;
                    $totalQuantity += $quantite;
                }
                unset($don);

                if ($aDistribuer > 0) {
                    throw new \RuntimeException('Don insuffisant pendant la répartition FIFO des propositions.');
                }
            }
        }

        $model->commit();

        return [
            'mode_dispatch' => $modeDispatch,
            'distribution_count' => $distributionCount,
            'total_quantity' => $totalQuantity,
        ];
    }

    private function sanitizeMode(string $mode): string
    {
        if (in_array($mode, ['fifo', 'proportionnel', 'priorite_petits'], true)) {
            return $mode;
        }
        return 'fifo';
    }

    private function successMessageByMode(string $mode): string
    {
        if ($mode === 'proportionnel') {
            return 'Dispatch proportionnel validé avec succès.';
        }
        if ($mode === 'priorite_petits') {
            return 'Dispatch priorité petits validé avec succès.';
        }
        return 'Dispatch FIFO validé avec succès.';
    }

    private function buildSummary(array $draftRows, array $dons, string $modeDispatch = 'fifo'): array
    {
        $totalQuantity = 0.0;
        $donDistributed = [];

        foreach ($draftRows as $row) {
            $quantity = (float) ($row['quantite_proposee'] ?? 0);
            $idDon = (int) ($row['id_don'] ?? 0);
            $totalQuantity += $quantity;

            if (!isset($donDistributed[$idDon])) {
                $donDistributed[$idDon] = 0.0;
            }
            $donDistributed[$idDon] += $quantity;
        }

        $donState = [];
        foreach ($dons as $don) {
            $idDon = (int) $don['id_don'];
            $distributedDraft = $donDistributed[$idDon] ?? 0.0;
            $total = (float) $don['quantite_totale'];
            $alreadyUsed = (float) ($don['quantite_utilisee'] ?? 0);
            $used = $alreadyUsed + $distributedDraft;
            $remaining = max($total - $used, 0);
            $percent = $total > 0 ? round(($used / $total) * 100, 2) : 0;

            $donState[] = [
                'id_don' => $idDon,
                'type_besoin' => (string) $don['type_besoin'],
                'quantite_totale' => $total,
                'quantite_deja_utilisee' => $alreadyUsed,
                'quantite_distribuee' => $distributedDraft,
                'quantite_restante' => $remaining,
                'completion_percent' => $percent,
            ];
        }

        return [
            'mode_dispatch' => $modeDispatch,
            'distribution_count' => count($draftRows),
            'don_count' => count(array_unique(array_column($draftRows, 'id_don'))),
            'total_quantity' => $totalQuantity,
            'dons' => $donState,
        ];
    }

    private function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
