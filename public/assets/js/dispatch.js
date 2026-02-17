var state = {
    modeDispatch: 'fifo',
    draftRows: [],
    eligibleCitiesByType: {},
    needRemainings: {},
    summary: null
};

var el = {
    validateBtn:            document.getElementById('validateBtn'),
    resetDataBtn:           document.getElementById('resetDataBtn'),
    cancelBtn:              document.getElementById('cancelBtn'),
    emptyState:             document.getElementById('emptyState'),
    noResultsState:         document.getElementById('noResultsState'),
    simulationResults:      document.getElementById('simulationResults'),
    resultsTitle:           document.getElementById('resultsTitle'),
    resultsTableHead:       document.getElementById('resultsTableHead'),
    resultsTableBody:       document.getElementById('resultsTableBody'),
    theadFifo:              document.getElementById('theadRowFifo'),
    theadProportionnel:     document.getElementById('theadRowProportionnel'),
    theadPrioritePetits:    document.getElementById('theadRowPrioritePetits'),
    summaryBlock:           document.getElementById('summaryBlock'),
    summaryNbDistributions: document.querySelector('.summary-nb-distributions'),
    summaryNbDons:          document.querySelector('.summary-nb-dons'),
    summaryQteTotale:       document.querySelector('.summary-qte-totale'),
    summaryNbSatisfaits:    document.querySelector('.summary-nb-satisfaits'),
    summaryNbPartiels:      document.querySelector('.summary-nb-partiels'),
    summaryNbZero:          document.querySelector('.summary-nb-zero'),
    summaryStatDons:        document.querySelector('.summary-stat-dons'),
    summaryStatSatisfaits:  document.querySelector('.summary-stat-satisfaits'),
    summaryDonsContainer:   document.getElementById('summaryDonsContainer'),
    summaryTypesContainer:  document.getElementById('summaryTypesContainer'),
    toast:                  document.getElementById('toast'),
    toastTitle:             document.getElementById('toastTitle'),
    toastDescription:       document.getElementById('toastDescription'),
    modeButtons:            document.querySelectorAll('[data-mode-dispatch]'),
    tplRowFifo:             document.getElementById('tpl-row-fifo'),
    tplRowProportionnel:    document.getElementById('tpl-row-proportionnel'),
    tplRowPrioritePetits:   document.getElementById('tpl-row-priorite'),
    tplSummaryDon:          document.getElementById('tpl-summary-don'),
    tplSummaryType:         document.getElementById('tpl-summary-type')
};

/* =========================================================================
   UTILITAIRES
   ========================================================================= */

function apiUrl(path) {
    var base = window.BASE_URL || '';
    var clean = String(path || '');
    if (clean.charAt(0) !== '/') {
        clean = '/' + clean;
    }
    return base + clean;
}

function cloneTemplate(tpl) {
    return tpl.content.cloneNode(true).children[0];
}

function getUsedDonQuantities() {
    var map = {};
    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        if (!row.id_don) { continue; }
        map[row.id_don] = (map[row.id_don] || 0) + Number(row.quantite_proposee || 0);
    }
    return map;
}

function getDonLimitById(idDon) {
    if (!state.summary || !state.summary.dons) { return 0; }
    for (var i = 0; i < state.summary.dons.length; i++) {
        var don = state.summary.dons[i];
        if (Number(don.id_don) !== Number(idDon)) { continue; }
        return Math.max(Number(don.quantite_totale || 0) - Number(don.quantite_deja_utilisee || 0), 0);
    }
    return 0;
}

function getPrioriteStatus(row) {
    var besoin = Number(row.besoin_restant || 0);
    var qte    = Number(row.quantite_proposee || 0);
    if (qte >= besoin && besoin > 0) {
        return { key: 'satisfait', label: 'Satisfait', className: 'badge-satisfait' };
    }
    if (qte > 0) {
        return { key: 'partiel', label: 'Partiel', className: 'badge-partiel' };
    }
    return { key: 'zero', label: 'Non satisfait', className: 'badge-zero' };
}

function calcPct(qte, besoin) {
    return Number(besoin) > 0
        ? ((Number(qte) / Number(besoin)) * 100).toFixed(1) + '%'
        : '0.0%';
}

/* =========================================================================
   ÉTATS D'AFFICHAGE
   ========================================================================= */

function setValidateVisible(visible) {
    if (!el.validateBtn) { return; }
    el.validateBtn.style.display = visible ? 'inline-flex' : 'none';
}

function showEmptyState() {
    el.emptyState.style.display        = 'block';
    el.noResultsState.style.display    = 'none';
    el.simulationResults.style.display = 'none';
    setValidateVisible(false);
}

function showNoResultsState() {
    el.emptyState.style.display        = 'none';
    el.noResultsState.style.display    = 'block';
    el.simulationResults.style.display = 'none';
    setValidateVisible(false);
}

function showSimulationResults() {
    el.emptyState.style.display        = 'none';
    el.noResultsState.style.display    = 'none';
    el.simulationResults.style.display = 'block';
    setValidateVisible(true);
}

function showToast(title, description, isError) {
    el.toastTitle.textContent       = title;
    el.toastDescription.textContent = description;
    el.toast.style.background = isError
        ? 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)'
        : 'linear-gradient(135deg, #27AE60 0%, #229954 100%)';
    el.toast.classList.add('show');
    setTimeout(function () { el.toast.classList.remove('show'); }, 3500);
}

function setActiveModeButton(mode) {
    for (var i = 0; i < el.modeButtons.length; i++) {
        var btn = el.modeButtons[i];
        if (btn.getAttribute('data-mode-dispatch') === mode) {
            btn.classList.add('is-active');
        } else {
            btn.classList.remove('is-active');
        }
    }
}

/* =========================================================================
   EN-TÊTES DE TABLE
   ========================================================================= */

function renderTableHead() {
    el.theadFifo.style.display            = 'none';
    el.theadProportionnel.style.display   = 'none';
    el.theadPrioritePetits.style.display  = 'none';

    if (state.modeDispatch === 'proportionnel') {
        el.theadProportionnel.style.display = '';
    } else if (state.modeDispatch === 'priorite_petits') {
        el.theadPrioritePetits.style.display = '';
    } else {
        el.theadFifo.style.display = '';
    }
}

/* =========================================================================
   CONSTRUCTION DES LIGNES — FIFO
   ========================================================================= */

function buildRowFifo(row, index) {
    var tr = cloneTemplate(el.tplRowFifo);
    tr.dataset.index = index;

    tr.querySelector('.td-don-label').textContent   = row.don_label;
    tr.querySelector('.td-don-used').textContent    = Number(row.don_quantite_utilisee || 0).toFixed(2) + ' / ' + Number(row.don_quantite_totale || 0).toFixed(2);
    tr.querySelector('.td-type .badge').textContent = row.type_besoin;
    tr.querySelector('.td-need-satisfied').textContent =
        Number(row.besoin_quantite_satisfaite || 0).toFixed(2) + ' / ' + Number(row.besoin_quantite_demandee || 0).toFixed(2);

    var input = tr.querySelector('input[data-action="quantity"]');
    input.max   = row.quantite_max_initiale;
    input.value = row.quantite_proposee;
    input.dataset.index = index;

    tr.querySelector('.input-max-hint').textContent = 'max initial: ' + Number(row.quantite_max_initiale).toFixed(2);

    var select = tr.querySelector('select[data-action="city"]');
    select.dataset.index = index;
    var cities = state.eligibleCitiesByType[row.id_type] || [];
    for (var j = 0; j < cities.length; j++) {
        var city   = cities[j];
        var option = document.createElement('option');
        option.value       = city.id_ville;
        option.textContent = city.nom + ' (' + Number(city.besoin_restant).toFixed(2) + ')';
        if (Number(city.id_ville) === Number(row.id_ville)) { option.selected = true; }
        select.appendChild(option);
    }

    var btnRemove = tr.querySelector('button[data-action="remove"]');
    btnRemove.dataset.index = index;

    return tr;
}

/* =========================================================================
   CONSTRUCTION DES LIGNES — PROPORTIONNEL
   ========================================================================= */

function buildRowProportionnel(row, index) {
    var tr = cloneTemplate(el.tplRowProportionnel);
    tr.dataset.index = index;

    tr.querySelector('.td-type .badge').textContent  = row.type_besoin;
    tr.querySelector('.td-ville').textContent         = row.ville;
    tr.querySelector('.td-produit').textContent       = row.nom_produit;
    tr.querySelector('.td-besoin-restant').textContent = String(Number(row.besoin_restant));
    tr.querySelector('.td-pct').textContent            = calcPct(row.quantite_proposee, row.besoin_restant);

    var input = tr.querySelector('input[data-action="quantity"]');
    input.max         = row.besoin_restant;
    input.value       = row.quantite_proposee;
    input.dataset.index = index;

    tr.querySelector('button[data-action="reset"]').dataset.index = index;

    return tr;
}

/* =========================================================================
   CONSTRUCTION DES LIGNES — PRIORITÉ PETITS
   ========================================================================= */

function buildRowPrioritePetits(row, index) {
    var tr     = cloneTemplate(el.tplRowPrioritePetits);
    var status = getPrioriteStatus(row);

    tr.dataset.index = index;
    tr.className    += ' ' + (status.key === 'satisfait' ? 'row-success' : (status.key === 'partiel' ? 'row-warning' : 'row-danger'));

    tr.querySelector('.td-index').textContent            = String(index + 1);
    tr.querySelector('.td-type .badge').textContent      = row.type_besoin;
    tr.querySelector('.td-ville').textContent             = row.ville;
    tr.querySelector('.td-produit').textContent           = row.nom_produit;
    tr.querySelector('.td-besoin-restant').textContent    = String(Number(row.besoin_restant));
    tr.querySelector('.td-pct').textContent               = calcPct(row.quantite_proposee, row.besoin_restant);

    var statusBadge = tr.querySelector('.status-badge');
    statusBadge.className   = 'status-badge ' + status.className;
    statusBadge.textContent = status.label;

    var input = tr.querySelector('input[data-action="quantity"]');
    input.max         = row.besoin_restant;
    input.value       = row.quantite_proposee;
    input.dataset.index = index;

    tr.querySelector('button[data-action="reset"]').dataset.index = index;

    return tr;
}

/* =========================================================================
   RENDU DE LA TABLE
   ========================================================================= */

function renderTable() {
    renderTableHead();

    var modeLabels = {
        fifo:            'FIFO (Simulation)',
        proportionnel:   'proportionnels (Simulation)',
        priorite_petits: 'priorité petits (Simulation)'
    };
    el.resultsTitle.textContent = 'Résultats ' + (modeLabels[state.modeDispatch] || state.modeDispatch) + ' — ' + state.draftRows.length + ' proposition(s)';

    el.resultsTableBody.textContent = '';
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        var tr;
        if (state.modeDispatch === 'proportionnel') {
            tr = buildRowProportionnel(row, i);
        } else if (state.modeDispatch === 'priorite_petits') {
            tr = buildRowPrioritePetits(row, i);
        } else {
            tr = buildRowFifo(row, i);
        }
        fragment.appendChild(tr);
    }

    el.resultsTableBody.appendChild(fragment);
}

/* =========================================================================
   RÉSUMÉ — BLOCS PARTAGÉS
   ========================================================================= */

function renderSummaryTypesContainer(showRatio) {
    el.summaryTypesContainer.textContent = '';
    var types = state.summary && state.summary.types ? state.summary.types : [];
    var fragment = document.createDocumentFragment();

    for (var j = 0; j < types.length; j++) {
        var t   = types[j];
        var box = cloneTemplate(el.tplSummaryType);

        box.querySelector('.type-title').textContent          = t.type_besoin;
        box.querySelector('.type-don-disponible').textContent = 'Don disponible: ' + t.don_disponible;
        box.querySelector('.type-besoin-total').textContent   = 'Besoin total: ' + t.besoin_total;

        var ratioEl = box.querySelector('.type-ratio');
        if (showRatio) {
            ratioEl.style.display = '';
            ratioEl.textContent   = 'Ratio: ' + Number(t.ratio_pct).toFixed(2) + '%';
        }

        var surplusEl = box.querySelector('.type-surplus');
        surplusEl.textContent = 'Surplus: ' + t.surplus;
        if (Number(t.surplus) > 0) {
            surplusEl.className += ' summary-surplus-warning';
        }

        fragment.appendChild(box);
    }

    el.summaryTypesContainer.appendChild(fragment);
}

/* =========================================================================
   RÉSUMÉ — FIFO
   ========================================================================= */

function renderSummaryFifo() {
    var usedByDon     = getUsedDonQuantities();
    var totalQuantity = 0;
    var distinctDonSet = {};

    for (var i = 0; i < state.draftRows.length; i++) {
        totalQuantity += Number(state.draftRows[i].quantite_proposee);
        if (state.draftRows[i].id_don) {
            distinctDonSet[state.draftRows[i].id_don] = true;
        }
    }

    var distinctDon = 0;
    for (var key in distinctDonSet) {
        if (Object.prototype.hasOwnProperty.call(distinctDonSet, key)) { distinctDon++; }
    }

    el.summaryNbDistributions.textContent = state.draftRows.length;
    el.summaryNbDons.textContent          = distinctDon;
    el.summaryQteTotale.textContent       = totalQuantity.toFixed(2);

    el.summaryStatDons.style.display       = '';
    el.summaryStatSatisfaits.style.display = 'none';

    el.summaryDonsContainer.textContent = '';
    var dons     = state.summary && state.summary.dons ? state.summary.dons : [];
    var fragment = document.createDocumentFragment();

    for (var j = 0; j < dons.length; j++) {
        var don        = dons[j];
        var draftUsed  = Number(usedByDon[don.id_don] || 0);
        var alreadyUsed = Number(don.quantite_deja_utilisee || 0);
        var total       = Number(don.quantite_totale || 0);
        var used        = alreadyUsed + draftUsed;
        var remain      = Math.max(total - used, 0);
        var pct         = total > 0 ? ((used / total) * 100).toFixed(2) : '0.00';

        var box = cloneTemplate(el.tplSummaryDon);
        box.querySelector('.don-title').textContent        = 'Don #' + don.id_don + ' (' + don.type_besoin + ')';
        box.querySelector('.don-already-used').textContent = 'Déjà utilisé: ' + alreadyUsed.toFixed(2);
        box.querySelector('.don-draft-used').textContent   = 'Ajout simulation: ' + draftUsed.toFixed(2) + ' (' + pct + '% cumulé)';
        box.querySelector('.don-restant').textContent      = 'Restant: ' + remain.toFixed(2);
        fragment.appendChild(box);
    }

    el.summaryDonsContainer.appendChild(fragment);
    el.summaryTypesContainer.textContent = '';
}

/* =========================================================================
   RÉSUMÉ — PROPORTIONNEL
   ========================================================================= */

function renderSummaryProportionnel() {
    var totalQty = 0;
    for (var i = 0; i < state.draftRows.length; i++) {
        totalQty += Number(state.draftRows[i].quantite_proposee || 0);
    }

    el.summaryNbDistributions.textContent  = state.draftRows.length;
    el.summaryQteTotale.textContent        = String(totalQty);
    el.summaryStatDons.style.display       = 'none';
    el.summaryStatSatisfaits.style.display = 'none';

    el.summaryDonsContainer.textContent = '';
    renderSummaryTypesContainer(true);
}

/* =========================================================================
   RÉSUMÉ — PRIORITÉ PETITS
   ========================================================================= */

function renderSummaryPrioritePetits() {
    var totalQty    = 0;
    var nbSatisfaits = 0;
    var nbPartiels   = 0;
    var nbZero       = 0;

    for (var i = 0; i < state.draftRows.length; i++) {
        var row    = state.draftRows[i];
        var status = getPrioriteStatus(row);
        totalQty  += Number(row.quantite_proposee || 0);
        if (status.key === 'satisfait')   { nbSatisfaits++; }
        else if (status.key === 'partiel') { nbPartiels++; }
        else                               { nbZero++; }
    }

    el.summaryNbDistributions.textContent  = state.draftRows.length;
    el.summaryQteTotale.textContent        = String(totalQty);
    el.summaryNbSatisfaits.textContent     = nbSatisfaits;
    el.summaryNbPartiels.textContent       = nbPartiels;
    el.summaryNbZero.textContent           = nbZero;
    el.summaryStatDons.style.display       = 'none';
    el.summaryStatSatisfaits.style.display = '';

    el.summaryDonsContainer.textContent = '';
    renderSummaryTypesContainer(false);
}

/* =========================================================================
   RÉSUMÉ — DISPATCH
   ========================================================================= */

function renderSummary() {
    if (state.modeDispatch === 'proportionnel') {
        renderSummaryProportionnel();
    } else if (state.modeDispatch === 'priorite_petits') {
        renderSummaryPrioritePetits();
    } else {
        renderSummaryFifo();
    }
}

/* =========================================================================
   RENDU GLOBAL
   ========================================================================= */

function rerenderDraft() {
    if (state.draftRows.length === 0) {
        showNoResultsState();
        return;
    }
    renderTable();
    renderSummary();
    showSimulationResults();
}

/* =========================================================================
   SIMULATION
   ========================================================================= */

function handleSimulate(mode) {
    if (mode) { state.modeDispatch = mode; }
    setActiveModeButton(state.modeDispatch);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl('api/dispatch/simulate?mode_dispatch=' + encodeURIComponent(state.modeDispatch)), true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                var data             = response.data || {};
                state.modeDispatch   = data.mode_dispatch || state.modeDispatch;
                state.draftRows      = data.distributions || [];
                state.eligibleCitiesByType = data.eligible_cities_by_type || {};
                state.needRemainings = data.need_remainings || {};
                state.summary        = data.summary || null;

                if (state.draftRows.length === 0) {
                    showNoResultsState();
                } else {
                    rerenderDraft();
                }
            } else {
                showToast('Erreur', response.message || 'Erreur API', true);
                showNoResultsState();
            }
        } else {
            var errMsg = 'Erreur HTTP ' + xhr.status;
            try {
                var errResp = JSON.parse(xhr.responseText);
                if (errResp && errResp.message) { errMsg = errResp.message; }
            } catch (e) { /* ignore */ }
            showToast('Erreur', errMsg, true);
            showNoResultsState();
        }
    };

    xhr.onerror = function () { showToast('Erreur', 'Erreur réseau', true); showNoResultsState(); };
    xhr.send();
}

/* =========================================================================
   INTERACTIONS UTILISATEUR
   ========================================================================= */

function handleQuantityChange(index, value) {
    var row    = state.draftRows[index];
    if (!row)  { return; }

    var parsed = Number(value);
    if (isNaN(parsed) || parsed < 0) {
        showToast('Validation', 'La quantité doit être >= 0.', true);
        rerenderDraft();
        return;
    }

    if (state.modeDispatch === 'proportionnel' || state.modeDispatch === 'priorite_petits') {
        if (Math.floor(parsed) !== parsed) {
            showToast('Validation', 'Ce mode accepte uniquement des entiers.', true);
            rerenderDraft();
            return;
        }
        if (parsed > Number(row.besoin_restant)) {
            showToast('Validation', 'La quantité dépasse le besoin restant.', true);
            rerenderDraft();
            return;
        }
        row.quantite_proposee = parsed;
        rerenderDraft();
        return;
    }

    if (parsed > Number(row.quantite_max_initiale)) {
        showToast('Validation', 'La quantité dépasse la proposition initiale.', true);
        rerenderDraft();
        return;
    }

    var previous      = Number(row.quantite_proposee);
    row.quantite_proposee = parsed;

    var usedByDon = getUsedDonQuantities();
    var limit     = getDonLimitById(row.id_don);
    if ((usedByDon[row.id_don] || 0) > limit + 0.00001) {
        row.quantite_proposee = previous;
        showToast('Validation', 'La somme distribuée dépasse la quantité disponible du don.', true);
        rerenderDraft();
        return;
    }

    rerenderDraft();
}

function handleCityChange(index, idVille) {
    var row = state.draftRows[index];
    if (!row) { return; }
    row.id_ville = Number(idVille);
    rerenderDraft();
}

function handleRemove(index) {
    state.draftRows = state.draftRows.filter(function (_, i) { return i !== index; });
    rerenderDraft();
}

function handleReset(index) {
    var row = state.draftRows[index];
    if (!row) { return; }
    row.quantite_proposee = Number(row.quantite_initiale || 0);
    rerenderDraft();
}

function handleValidate() {
    if (state.draftRows.length === 0) {
        showToast('Validation', 'Aucune ligne à valider.', true);
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('api/dispatch/validate'), true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                showToast('Succès', response.message || 'Dispatch validé avec succès.', false);
                state.draftRows = [];
                state.summary   = null;
                showEmptyState();
            } else {
                showToast('Erreur', response.message || 'Erreur API', true);
            }
        } else {
            var errMsg = 'Erreur HTTP ' + xhr.status;
            try {
                var errResp = JSON.parse(xhr.responseText);
                if (errResp && errResp.message) { errMsg = errResp.message; }
            } catch (e) { /* ignore */ }
            showToast('Erreur', errMsg, true);
        }
    };

    xhr.onerror = function () { showToast('Erreur', 'Erreur réseau', true); };
    xhr.send(JSON.stringify({ mode_dispatch: state.modeDispatch, distributions: state.draftRows }));
}

function handleCancel() {
    state.draftRows = [];
    state.summary   = null;
    showEmptyState();
}

function handleResetData() {
    if (!window.confirm('Réinitialiser les besoins et les dons à l\'état initial ? Cette action efface aussi les dispatchs et achats enregistrés.')) {
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('api/dispatch/reset-data'), true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                state.draftRows            = [];
                state.eligibleCitiesByType = {};
                state.needRemainings       = {};
                state.summary              = null;
                showEmptyState();
                showToast('Succès', response.message || 'Réinitialisation terminée.', false);
            } else {
                showToast('Erreur', response.message || 'Erreur API', true);
            }
        } else {
            showToast('Erreur', 'Erreur HTTP ' + xhr.status, true);
        }
    };

    xhr.onerror = function () { showToast('Erreur', 'Erreur réseau', true); };
    xhr.send();
}

/* =========================================================================
   DÉLÉGATION D'ÉVÉNEMENTS TABLE
   ========================================================================= */

function onTableInput(event) {
    var target = event.target;
    if (target.getAttribute('data-action') === 'quantity') {
        handleQuantityChange(Number(target.getAttribute('data-index')), target.value);
    }
}

function onTableChange(event) {
    var target = event.target;
    if (target.getAttribute('data-action') === 'city') {
        handleCityChange(Number(target.getAttribute('data-index')), target.value);
    }
}

function onTableClick(event) {
    var target = event.target;
    var action = target.getAttribute('data-action');
    var index  = Number(target.getAttribute('data-index'));
    if (action === 'remove') { handleRemove(index); }
    if (action === 'reset')  { handleReset(index); }
}

function onModeButtonClick(event) {
    var mode = event.currentTarget.getAttribute('data-mode-dispatch');
    if (mode) { handleSimulate(mode); }
}

function init() {
    showEmptyState();
    setActiveModeButton(state.modeDispatch);

    for (var i = 0; i < el.modeButtons.length; i++) {
        el.modeButtons[i].addEventListener('click', onModeButtonClick);
    }
    if (el.validateBtn)       { el.validateBtn.addEventListener('click', handleValidate); }
    if (el.resetDataBtn)      { el.resetDataBtn.addEventListener('click', handleResetData); }
    if (el.cancelBtn)         { el.cancelBtn.addEventListener('click', handleCancel); }
    if (el.resultsTableBody) {
        el.resultsTableBody.addEventListener('input',  onTableInput);
        el.resultsTableBody.addEventListener('change', onTableChange);
        el.resultsTableBody.addEventListener('click',  onTableClick);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}