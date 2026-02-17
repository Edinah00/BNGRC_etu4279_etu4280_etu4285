<header class="page-header">
    <div class="header-content">
        <div class="header-text">
            <h1 class="page-title">Simulation de Dispatch</h1>
            <p class="page-description">Distribution des dons selon les besoins non satisfaits (FIFO, proportionnel ou priorité petits)</p>
        </div>
        <div class="header-actions">
            <button class="btn-success" id="validateBtn" type="button" style="display:none;">Valider et enregistrer</button>
            <button class="btn-primary btn-danger" id="resetDataBtn" type="button">Réinitialiser besoins/dons</button>
        </div>
    </div>
</header>

<section class="mode-selector" id="modeSelector">
    <button class="mode-button is-active" type="button" data-mode-dispatch="fifo">
        <span class="mode-title">FIFO</span>
        <span class="mode-desc">Premier arrivé, premier servi</span>
    </button>
    <button class="mode-button" type="button" data-mode-dispatch="proportionnel">
        <span class="mode-title">Proportionnel</span>
        <span class="mode-desc">Répartition selon le ratio de besoin restant</span>
    </button>
    <button class="mode-button mode-button-priorite" type="button" data-mode-dispatch="priorite_petits">
        <span class="mode-title">Priorité Petits</span>
        <span class="mode-desc">Les plus petits besoins sont satisfaits en premier</span>
    </button>
</section>

<section class="empty-state" id="emptyState">
    <div class="empty-state-card">
        <div class="empty-state-content">
            <h2 class="empty-state-title">Choisissez un mode pour lancer la distribution</h2>
            <p class="empty-state-text">Chaque bouton de mode démarre directement une simulation.</p>
        </div>
    </div>
</section>

<section class="no-results-state" id="noResultsState" style="display:none;">
    <div class="no-results-card">
        <div class="no-results-content">
            <h2 class="no-results-title">Aucune distribution possible</h2>
            <p class="no-results-text">Aucun don disponible ne correspond aux besoins restants.</p>
        </div>
    </div>
</section>

<section class="simulation-results" id="simulationResults" style="display:none;">
    <div class="results-card">
        <div class="results-header">
            <h3 class="results-title" id="resultsTitle">Résultat de la simulation</h3>
        </div>
        <div class="results-table-container">
            <table class="results-table">
                <thead id="resultsTableHead">
                    <tr id="theadRowFifo" class="thead-fifo" style="display:none;">
                        <th>Don</th>
                        <th>Don déjà utilisé</th>
                        <th>Type</th>
                        <th>Ville destinataire</th>
                        <th>Besoin déjà satisfait</th>
                        <th>Quantité proposée</th>
                        <th>Actions</th>
                    </tr>
                    <tr id="theadRowProportionnel" class="thead-proportionnel" style="display:none;">
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Produit</th>
                        <th>Besoin restant</th>
                        <th>Quantité proposée</th>
                        <th>% Satisfaction</th>
                        <th>Actions</th>
                    </tr>
                    <tr id="theadRowPrioritePetits" class="thead-priorite" style="display:none;">
                        <th>#</th>
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Produit</th>
                        <th>Besoin restant</th>
                        <th>Quantité proposée</th>
                        <th>% Satisfaction</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="resultsTableBody"></tbody>
            </table>
        </div>
    </div>

    <div class="results-card summary-card">
        <h3 class="results-title summary-title">Résumé du dispatch</h3>
        <div id="summaryBlock">
            <p class="summary-stat"><span class="summary-label">Nombre de distributions :</span> <strong class="summary-nb-distributions">—</strong></p>
            <p class="summary-stat summary-stat-dons"><span class="summary-label">Dons utilisés :</span> <strong class="summary-nb-dons">—</strong></p>
            <p class="summary-stat"><span class="summary-label">Quantité totale distribuée :</span> <strong class="summary-qte-totale">—</strong></p>
            <p class="summary-stat summary-stat-satisfaits"><span class="summary-label">Satisfaits 100% :</span> <strong class="summary-nb-satisfaits">—</strong> | Partiels : <strong class="summary-nb-partiels">—</strong> | Non satisfaits : <strong class="summary-nb-zero">—</strong></p>
            <div id="summaryDonsContainer"></div>
            <div id="summaryTypesContainer"></div>
        </div>
        <div class="summary-actions">
            <button class="btn-primary btn-cancel" id="cancelBtn" type="button">Annuler</button>
        </div>
    </div>
</section>

<div class="toast" id="toast">
    <div class="toast-content">
        <div class="toast-text">
            <p class="toast-title" id="toastTitle">Succès</p>
            <p class="toast-description" id="toastDescription">Opération terminée</p>
        </div>
    </div>
</div>

<!-- =====================================================================
     TEMPLATES DE LIGNES DE TABLE
     ===================================================================== -->

<!-- Ligne FIFO -->
<template id="tpl-row-fifo">
    <tr>
        <td class="td-don-label"></td>
        <td class="td-don-used"></td>
        <td class="td-type"><span class="badge"></span></td>
        <td class="td-ville"><select data-action="city"></select></td>
        <td class="td-need-satisfied"></td>
        <td class="td-quantite">
            <input type="number" min="0" step="0.01" data-action="quantity">
            <small class="input-max-hint"></small>
        </td>
        <td class="td-actions">
            <button type="button" data-action="remove" class="btn-primary btn-remove">Supprimer</button>
        </td>
    </tr>
</template>

<!-- Ligne Proportionnel -->
<template id="tpl-row-proportionnel">
    <tr>
        <td class="td-type"><span class="badge"></span></td>
        <td class="td-ville"></td>
        <td class="td-produit"></td>
        <td class="td-besoin-restant"></td>
        <td class="td-quantite">
            <input type="number" min="0" step="1" data-action="quantity">
        </td>
        <td class="td-pct"></td>
        <td class="td-actions">
            <button type="button" data-action="reset" class="btn-primary btn-reset">Réinitialiser</button>
        </td>
    </tr>
</template>

<!-- Ligne Priorité Petits -->
<template id="tpl-row-priorite">
    <tr>
        <td class="td-index"></td>
        <td class="td-type"><span class="badge"></span></td>
        <td class="td-ville"></td>
        <td class="td-produit"></td>
        <td class="td-besoin-restant"></td>
        <td class="td-quantite">
            <input type="number" min="0" step="1" data-action="quantity">
        </td>
        <td class="td-pct"></td>
        <td class="td-statut"><span class="status-badge"></span></td>
        <td class="td-actions">
            <button type="button" data-action="reset" class="btn-primary btn-reset">Réinitialiser</button>
        </td>
    </tr>
</template>

<!-- =====================================================================
     TEMPLATES DE RÉSUMÉ
     ===================================================================== -->

<!-- Bloc résumé d'un don (FIFO) -->
<template id="tpl-summary-don">
    <div class="summary-don-box">
        <strong class="don-title"></strong>
        <div class="don-already-used"></div>
        <div class="don-draft-used"></div>
        <div class="don-restant"></div>
    </div>
</template>

<!-- Bloc résumé d'un type (Proportionnel / Priorité) -->
<template id="tpl-summary-type">
    <div class="summary-type-box">
        <strong class="type-title"></strong>
        <div class="type-don-disponible"></div>
        <div class="type-besoin-total"></div>
        <div class="type-ratio" style="display:none;"></div>
        <div class="type-surplus"></div>
    </div>
</template>