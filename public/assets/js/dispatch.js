var state = {
    modeDispatch: 'fifo',
    draftRows: [],
    eligibleCitiesByType: {},
    needRemainings: {},
    summary: null
};

var elements = {
    validateBtn: document.getElementById('validateBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    emptyState: document.getElementById('emptyState'),
    noResultsState: document.getElementById('noResultsState'),
    simulationResults: document.getElementById('simulationResults'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsTableHead: document.getElementById('resultsTableHead'),
    resultsTableBody: document.getElementById('resultsTableBody'),
    summaryBlock: document.getElementById('summaryBlock'),
    toast: document.getElementById('toast'),
    toastTitle: document.getElementById('toastTitle'),
    toastDescription: document.getElementById('toastDescription'),
    modeButtons: document.querySelectorAll('[data-mode-dispatch]')
};

function setValidateVisible(visible) {
    if (!elements.validateBtn) return;
    elements.validateBtn.style.display = visible ? 'inline-flex' : 'none';
}

function showEmptyState() {
    elements.emptyState.style.display = 'block';
    elements.noResultsState.style.display = 'none';
    elements.simulationResults.style.display = 'none';
    setValidateVisible(false);
}

function showNoResultsState() {
    elements.emptyState.style.display = 'none';
    elements.noResultsState.style.display = 'block';
    elements.simulationResults.style.display = 'none';
    setValidateVisible(false);
}

function showSimulationResults() {
    elements.emptyState.style.display = 'none';
    elements.noResultsState.style.display = 'none';
    elements.simulationResults.style.display = 'block';
    setValidateVisible(true);
}

function showToast(title, description, isError) {
    elements.toastTitle.textContent = title;
    elements.toastDescription.textContent = description;
    elements.toast.style.background = isError
        ? 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)'
        : 'linear-gradient(135deg, #27AE60 0%, #229954 100%)';
    elements.toast.classList.add('show');
    setTimeout(function() {
        elements.toast.classList.remove('show');
    }, 3500);
}

function apiUrl(path) {
    var cleanPath = String(path).replace(/^\/+/, '');
    var base = window.location.pathname.replace(/\/dispatch\/?$/, '/');
    return base + cleanPath;
}

function setActiveModeButton(mode) {
    for (var i = 0; i < elements.modeButtons.length; i++) {
        var btn = elements.modeButtons[i];
        var btnMode = btn.getAttribute('data-mode-dispatch');
        if (btnMode === mode) {
            btn.classList.add('is-active');
        } else {
            btn.classList.remove('is-active');
        }
    }
}

function getUsedDonQuantities() {
    var map = {};
    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        if (!row.id_don) {
            continue;
        }
        map[row.id_don] = (map[row.id_don] || 0) + Number(row.quantite_proposee || 0);
    }
    return map;
}

function getDonLimitById(idDon) {
    if (!state.summary || !state.summary.dons) {
        return 0;
    }

    for (var i = 0; i < state.summary.dons.length; i++) {
        var don = state.summary.dons[i];
        if (Number(don.id_don) !== Number(idDon)) {
            continue;
        }
        var total = Number(don.quantite_totale || 0);
        var alreadyUsed = Number(don.quantite_deja_utilisee || 0);
        return Math.max(total - alreadyUsed, 0);
    }

    return 0;
}

function renderTableHead() {
    elements.resultsTableHead.textContent = '';
    var tr = document.createElement('tr');

    if (state.modeDispatch === 'proportionnel') {
        tr.innerHTML = '<th>Type</th><th>Ville</th><th>Produit</th><th>Besoin restant</th><th>Quantité proposée</th><th>% Satisfaction</th><th>Actions</th>';
    } else if (state.modeDispatch === 'priorite_petits') {
        tr.innerHTML = '<th>#</th><th>Type</th><th>Ville</th><th>Produit</th><th>Besoin restant</th><th>Quantité proposée</th><th>% Satisfaction</th><th>Statut</th><th>Actions</th>';
    } else {
        tr.innerHTML = '<th>Don</th><th>Don déjà utilisé</th><th>Type</th><th>Ville destinataire</th><th>Besoin déjà satisfait</th><th>Quantité proposée</th><th>Actions</th>';
    }

    elements.resultsTableHead.appendChild(tr);
}

function renderTableFifo() {
    elements.resultsTitle.textContent = 'Résultats FIFO (Simulation) - ' + state.draftRows.length + ' distribution(s)';
    elements.resultsTableBody.textContent = '';

    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        var tr = document.createElement('tr');
        tr.dataset.index = i;

        var tdDon = document.createElement('td');
        tdDon.textContent = row.don_label;

        var tdDonUsed = document.createElement('td');
        tdDonUsed.textContent = Number(row.don_quantite_utilisee || 0).toFixed(2) + ' / ' + Number(row.don_quantite_totale || 0).toFixed(2);

        var tdType = document.createElement('td');
        var badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = row.type_besoin;
        tdType.appendChild(badge);

        var tdVille = document.createElement('td');
        var selectVille = document.createElement('select');
        selectVille.dataset.action = 'city';
        selectVille.dataset.index = i;

        var cities = state.eligibleCitiesByType[row.id_type] || [];
        for (var j = 0; j < cities.length; j++) {
            var city = cities[j];
            var option = document.createElement('option');
            option.value = city.id_ville;
            option.textContent = city.nom + ' (' + Number(city.besoin_restant).toFixed(2) + ')';
            if (Number(city.id_ville) === Number(row.id_ville)) {
                option.selected = true;
            }
            selectVille.appendChild(option);
        }
        tdVille.appendChild(selectVille);

        var tdNeedSatisfied = document.createElement('td');
        tdNeedSatisfied.textContent = Number(row.besoin_quantite_satisfaite || 0).toFixed(2) + ' / ' + Number(row.besoin_quantite_demandee || 0).toFixed(2);

        var tdQuantite = document.createElement('td');
        var inputQte = document.createElement('input');
        inputQte.type = 'number';
        inputQte.min = '0';
        inputQte.step = '0.01';
        inputQte.max = row.quantite_max_initiale;
        inputQte.value = row.quantite_proposee;
        inputQte.dataset.action = 'quantity';
        inputQte.dataset.index = i;

        var small = document.createElement('small');
        small.style.display = 'block';
        small.style.opacity = '0.7';
        small.textContent = 'max initial: ' + Number(row.quantite_max_initiale).toFixed(2);

        tdQuantite.appendChild(inputQte);
        tdQuantite.appendChild(small);

        var tdActions = document.createElement('td');
        var btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.dataset.action = 'remove';
        btnRemove.dataset.index = i;
        btnRemove.className = 'btn-primary';
        btnRemove.style.padding = '0.4rem 0.7rem';
        btnRemove.style.background = '#c0392b';
        btnRemove.textContent = 'Supprimer';
        tdActions.appendChild(btnRemove);

        tr.appendChild(tdDon);
        tr.appendChild(tdDonUsed);
        tr.appendChild(tdType);
        tr.appendChild(tdVille);
        tr.appendChild(tdNeedSatisfied);
        tr.appendChild(tdQuantite);
        tr.appendChild(tdActions);

        elements.resultsTableBody.appendChild(tr);
    }
}

function renderTableProportionnel() {
    elements.resultsTitle.textContent = 'Résultats proportionnels (Simulation) - ' + state.draftRows.length + ' proposition(s)';
    elements.resultsTableBody.textContent = '';

    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        var tr = document.createElement('tr');
        tr.dataset.index = i;

        var tdType = document.createElement('td');
        var badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = row.type_besoin;
        tdType.appendChild(badge);

        var tdVille = document.createElement('td');
        tdVille.textContent = row.ville;

        var tdProduit = document.createElement('td');
        tdProduit.textContent = row.nom_produit;

        var tdBesoin = document.createElement('td');
        tdBesoin.textContent = String(Number(row.besoin_restant));

        var tdQuantite = document.createElement('td');
        var inputQte = document.createElement('input');
        inputQte.type = 'number';
        inputQte.min = '0';
        inputQte.step = '1';
        inputQte.max = row.besoin_restant;
        inputQte.value = row.quantite_proposee;
        inputQte.dataset.action = 'quantity';
        inputQte.dataset.index = i;
        tdQuantite.appendChild(inputQte);

        var tdPct = document.createElement('td');
        var pct = Number(row.besoin_restant) > 0
            ? ((Number(row.quantite_proposee) / Number(row.besoin_restant)) * 100).toFixed(1)
            : '0.0';
        tdPct.textContent = pct + '%';

        var tdActions = document.createElement('td');
        var btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.dataset.action = 'reset';
        btnReset.dataset.index = i;
        btnReset.className = 'btn-primary';
        btnReset.style.padding = '0.4rem 0.7rem';
        btnReset.textContent = 'Réinitialiser';
        tdActions.appendChild(btnReset);

        tr.appendChild(tdType);
        tr.appendChild(tdVille);
        tr.appendChild(tdProduit);
        tr.appendChild(tdBesoin);
        tr.appendChild(tdQuantite);
        tr.appendChild(tdPct);
        tr.appendChild(tdActions);

        elements.resultsTableBody.appendChild(tr);
    }
}

function getPrioriteStatus(row) {
    var besoin = Number(row.besoin_restant || 0);
    var qte = Number(row.quantite_proposee || 0);

    if (qte >= besoin && besoin > 0) {
        return { key: 'satisfait', label: 'Satisfait', className: 'badge-satisfait' };
    }
    if (qte > 0) {
        return { key: 'partiel', label: 'Partiel', className: 'badge-partiel' };
    }
    return { key: 'zero', label: 'Non satisfait', className: 'badge-zero' };
}
function renderTablePrioritePetits() {
    elements.resultsTitle.textContent = 'Résultats priorité petits (Simulation) - ' + state.draftRows.length + ' proposition(s)';
    elements.resultsTableBody.textContent = '';

    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        var status = getPrioriteStatus(row);
        var tr = document.createElement('tr');
        tr.dataset.index = i;
        tr.className = status.key === 'satisfait'
            ? 'row-success'
            : (status.key === 'partiel' ? 'row-warning' : 'row-danger');

        var tdIndex = document.createElement('td');
        tdIndex.textContent = String(i + 1);

        var tdType = document.createElement('td');
        var badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = row.type_besoin;
        tdType.appendChild(badge);

        var tdVille = document.createElement('td');
        tdVille.textContent = row.ville;

        var tdProduit = document.createElement('td');
        tdProduit.textContent = row.nom_produit;

        var tdBesoin = document.createElement('td');
        tdBesoin.textContent = String(Number(row.besoin_restant));

        var tdQuantite = document.createElement('td');
        var inputQte = document.createElement('input');
        inputQte.type = 'number';
        inputQte.min = '0';
        inputQte.step = '1';
        inputQte.max = row.besoin_restant;
        inputQte.value = row.quantite_proposee;
        inputQte.dataset.action = 'quantity';
        inputQte.dataset.index = i;
        tdQuantite.appendChild(inputQte);

        var tdPct = document.createElement('td');
        var pct = Number(row.besoin_restant) > 0
            ? ((Number(row.quantite_proposee) / Number(row.besoin_restant)) * 100).toFixed(1)
            : '0.0';
        tdPct.textContent = pct + '%';

        var tdStatus = document.createElement('td');
        var badgeStatus = document.createElement('span');
        badgeStatus.className = status.className;
        badgeStatus.textContent = status.label;
        tdStatus.appendChild(badgeStatus);

        var tdActions = document.createElement('td');
        var btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.dataset.action = 'reset';
        btnReset.dataset.index = i;
        btnReset.className = 'btn-primary';
        btnReset.style.padding = '0.4rem 0.7rem';
        btnReset.textContent = 'Réinitialiser';
        tdActions.appendChild(btnReset);

        tr.appendChild(tdIndex);
        tr.appendChild(tdType);
        tr.appendChild(tdVille);
        tr.appendChild(tdProduit);
        tr.appendChild(tdBesoin);
        tr.appendChild(tdQuantite);
        tr.appendChild(tdPct);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);

        elements.resultsTableBody.appendChild(tr);
    }
}

function renderTable() {
    renderTableHead();
    if (state.modeDispatch === 'proportionnel') {
        renderTableProportionnel();
    } else if (state.modeDispatch === 'priorite_petits') {
        renderTablePrioritePetits();
    } else {
        renderTableFifo();
    }
}

function renderSummaryFifo() {
    var usedByDon = getUsedDonQuantities();
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
        if (Object.prototype.hasOwnProperty.call(distinctDonSet, key)) {
            distinctDon += 1;
        }
    }

    elements.summaryBlock.textContent = '';

    var pNb = document.createElement('p');
    pNb.textContent = 'Nombre de distributions : ';
    var strongNb = document.createElement('strong');
    strongNb.textContent = state.draftRows.length;
    pNb.appendChild(strongNb);

    var pDons = document.createElement('p');
    pDons.textContent = 'Dons utilisés : ';
    var strongDons = document.createElement('strong');
    strongDons.textContent = distinctDon;
    pDons.appendChild(strongDons);

    var pQte = document.createElement('p');
    pQte.textContent = 'Quantité totale distribuée : ';
    var strongQte = document.createElement('strong');
    strongQte.textContent = totalQuantity.toFixed(2);
    pQte.appendChild(strongQte);

    elements.summaryBlock.appendChild(pNb);
    elements.summaryBlock.appendChild(pDons);
    elements.summaryBlock.appendChild(pQte);

    var donRowsContainer = document.createElement('div');
    donRowsContainer.style.marginTop = '0.8rem';

    var dons = state.summary && state.summary.dons ? state.summary.dons : [];
    for (var j = 0; j < dons.length; j++) {
        var don = dons[j];
        var draftUsed = Number(usedByDon[don.id_don] || 0);
        var alreadyUsed = Number(don.quantite_deja_utilisee || 0);
        var total = Number(don.quantite_totale || 0);
        var used = alreadyUsed + draftUsed;
        var remain = total - used;
        if (remain < 0) remain = 0;
        var pct = total > 0 ? ((used / total) * 100).toFixed(2) : '0.00';

        var div = document.createElement('div');
        div.style.border = '1px solid #dfe6e9';
        div.style.borderRadius = '8px';
        div.style.padding = '0.75rem';
        div.style.marginBottom = '0.6rem';

        var title = document.createElement('strong');
        title.textContent = 'Don #' + don.id_don + ' (' + don.type_besoin + ')';

        var alreadyLine = document.createElement('div');
        alreadyLine.textContent = 'Déjà utilisé: ' + alreadyUsed.toFixed(2);

        var distribLine = document.createElement('div');
        distribLine.textContent = 'Ajout simulation: ' + draftUsed.toFixed(2) + ' (' + pct + '% cumulé)';

        var restantLine = document.createElement('div');
        restantLine.textContent = 'Restant: ' + remain.toFixed(2);

        div.appendChild(title);
        div.appendChild(alreadyLine);
        div.appendChild(distribLine);
        div.appendChild(restantLine);
        donRowsContainer.appendChild(div);
    }

    elements.summaryBlock.appendChild(donRowsContainer);
}

function renderSummaryProportionnel() {
    elements.summaryBlock.textContent = '';

    var totalQty = 0;
    for (var i = 0; i < state.draftRows.length; i++) {
        totalQty += Number(state.draftRows[i].quantite_proposee || 0);
    }

    var pNb = document.createElement('p');
    pNb.textContent = 'Nombre de propositions : ';
    var strongNb = document.createElement('strong');
    strongNb.textContent = state.draftRows.length;
    pNb.appendChild(strongNb);

    var pQte = document.createElement('p');
    pQte.textContent = 'Quantité totale allouée : ';
    var strongQte = document.createElement('strong');
    strongQte.textContent = String(totalQty);
    pQte.appendChild(strongQte);

    elements.summaryBlock.appendChild(pNb);
    elements.summaryBlock.appendChild(pQte);

    var types = state.summary && state.summary.types ? state.summary.types : [];
    for (var j = 0; j < types.length; j++) {
        var t = types[j];

        var box = document.createElement('div');
        box.style.border = '1px solid #dfe6e9';
        box.style.borderRadius = '8px';
        box.style.padding = '0.75rem';
        box.style.marginBottom = '0.6rem';

        var title = document.createElement('strong');
        title.textContent = t.type_besoin;

        var l1 = document.createElement('div');
        l1.textContent = 'Don disponible: ' + t.don_disponible;

        var l2 = document.createElement('div');
        l2.textContent = 'Besoin total: ' + t.besoin_total;

        var l3 = document.createElement('div');
        l3.textContent = 'Ratio: ' + Number(t.ratio_pct).toFixed(2) + '%';

        var l4 = document.createElement('div');
        l4.textContent = 'Surplus: ' + t.surplus;
        if (Number(t.surplus) > 0) {
            l4.style.color = '#d35400';
            l4.style.fontWeight = '600';
        }

        box.appendChild(title);
        box.appendChild(l1);
        box.appendChild(l2);
        box.appendChild(l3);
        box.appendChild(l4);

        elements.summaryBlock.appendChild(box);
    }
}

function renderSummaryPrioritePetits() {
    elements.summaryBlock.textContent = '';

    var totalQty = 0;
    var nbSatisfaits = 0;
    var nbPartiels = 0;
    var nbZero = 0;

    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        totalQty += Number(row.quantite_proposee || 0);
        var status = getPrioriteStatus(row);
        if (status.key === 'satisfait') {
            nbSatisfaits += 1;
        } else if (status.key === 'partiel') {
            nbPartiels += 1;
        } else {
            nbZero += 1;
        }
    }

    var pNb = document.createElement('p');
    pNb.textContent = 'Nombre de propositions : ';
    var strongNb = document.createElement('strong');
    strongNb.textContent = state.draftRows.length;
    pNb.appendChild(strongNb);

    var pQte = document.createElement('p');
    pQte.textContent = 'Quantité totale allouée : ';
    var strongQte = document.createElement('strong');
    strongQte.textContent = String(totalQty);
    pQte.appendChild(strongQte);

    var pSat = document.createElement('p');
    pSat.innerHTML = 'Satisfaits 100% : <strong>' + nbSatisfaits + '</strong> | Partiels : <strong>' + nbPartiels + '</strong> | Non satisfaits : <strong>' + nbZero + '</strong>';

    elements.summaryBlock.appendChild(pNb);
    elements.summaryBlock.appendChild(pQte);
    elements.summaryBlock.appendChild(pSat);

    var types = state.summary && state.summary.types ? state.summary.types : [];
    for (var j = 0; j < types.length; j++) {
        var t = types[j];

        var box = document.createElement('div');
        box.style.border = '1px solid #dfe6e9';
        box.style.borderRadius = '8px';
        box.style.padding = '0.75rem';
        box.style.marginBottom = '0.6rem';

        var title = document.createElement('strong');
        title.textContent = t.type_besoin;

        var l1 = document.createElement('div');
        l1.textContent = 'Don disponible: ' + t.don_disponible;

        var l2 = document.createElement('div');
        l2.textContent = 'Besoin total: ' + t.besoin_total;

        var l3 = document.createElement('div');
        l3.textContent = 'Surplus: ' + t.surplus;
        if (Number(t.surplus) > 0) {
            l3.style.color = '#d35400';
            l3.style.fontWeight = '600';
        }

        box.appendChild(title);
        box.appendChild(l1);
        box.appendChild(l2);
        box.appendChild(l3);

        elements.summaryBlock.appendChild(box);
    }
}

function renderSummary() {
    if (state.modeDispatch === 'proportionnel') {
        renderSummaryProportionnel();
    } else if (state.modeDispatch === 'priorite_petits') {
        renderSummaryPrioritePetits();
    } else {
        renderSummaryFifo();
    }
}

function rerenderDraft() {
    if (state.draftRows.length === 0) {
        showNoResultsState();
        return;
    }

    renderTable();
    renderSummary();
    showSimulationResults();
}

function handleSimulate(mode) {
    if (mode) {
        state.modeDispatch = mode;
    }
    setActiveModeButton(state.modeDispatch);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl('api/dispatch/simulate?mode_dispatch=' + encodeURIComponent(state.modeDispatch)), true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                var data = response.data || {};
                state.modeDispatch = data.mode_dispatch || state.modeDispatch;
                state.draftRows = data.distributions || [];
                state.eligibleCitiesByType = data.eligible_cities_by_type || {};
                state.needRemainings = data.need_remainings || {};
                state.summary = data.summary || null;

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
            var errorResponse = null;
            try {
                errorResponse = JSON.parse(xhr.responseText);
            } catch (e) {
                errorResponse = null;
            }
            var message = errorResponse && errorResponse.message
                ? errorResponse.message
                : ('Erreur HTTP ' + xhr.status);
            showToast('Erreur', message, true);
            showNoResultsState();
        }
    };

    xhr.onerror = function() {
        showToast('Erreur', 'Erreur réseau', true);
        showNoResultsState();
    };

    xhr.send();
}

function handleQuantityChange(index, value) {
    var row = state.draftRows[index];
    if (!row) return;

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

    var previous = Number(row.quantite_proposee);
    row.quantite_proposee = parsed;

    var usedByDon = getUsedDonQuantities();
    var limit = getDonLimitById(row.id_don);
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
    if (!row) return;
    row.id_ville = Number(idVille);
    rerenderDraft();
}

function handleRemove(index) {
    var newRows = [];
    for (var i = 0; i < state.draftRows.length; i++) {
        if (i !== index) {
            newRows.push(state.draftRows[i]);
        }
    }
    state.draftRows = newRows;
    rerenderDraft();
}

function handleReset(index) {
    var row = state.draftRows[index];
    if (!row) return;
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

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                showToast('Succès', response.message || 'Dispatch validé avec succès.', false);
                state.draftRows = [];
                state.summary = null;
                showEmptyState();
            } else {
                showToast('Erreur', response.message || 'Erreur API', true);
            }
        } else {
            var errorResponse = null;
            try {
                errorResponse = JSON.parse(xhr.responseText);
            } catch (e) {
                errorResponse = null;
            }
            var message = errorResponse && errorResponse.message
                ? errorResponse.message
                : ('Erreur HTTP ' + xhr.status);
            showToast('Erreur', message, true);
        }
    };

    xhr.onerror = function() {
        showToast('Erreur', 'Erreur réseau', true);
    };

    xhr.send(JSON.stringify({
        mode_dispatch: state.modeDispatch,
        distributions: state.draftRows
    }));
}

function handleCancel() {
    state.draftRows = [];
    state.summary = null;
    showEmptyState();
}

function handleResetData() {
    var confirmed = window.confirm('Réinitialiser les besoins et les dons à l\'état initial ? Cette action efface aussi les dispatchs et achats enregistrés.');
    if (!confirmed) {
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('api/dispatch/reset-data'), true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                state.draftRows = [];
                state.eligibleCitiesByType = {};
                state.needRemainings = {};
                state.summary = null;
                showEmptyState();
                showToast('Succès', response.message || 'Réinitialisation terminée.', false);
            } else {
                showToast('Erreur', response.message || 'Erreur API', true);
            }
        } else {
            showToast('Erreur', 'Erreur HTTP ' + xhr.status, true);
        }
    };

    xhr.onerror = function() {
        showToast('Erreur', 'Erreur réseau', true);
    };

    xhr.send();
}

function onTableInput(event) {
    var target = event.target;
    var action = target.getAttribute('data-action');
    var index = Number(target.getAttribute('data-index'));
    if (action === 'quantity') {
        handleQuantityChange(index, target.value);
    }
}

function onTableChange(event) {
    var target = event.target;
    var action = target.getAttribute('data-action');
    var index = Number(target.getAttribute('data-index'));
    if (action === 'city') {
        handleCityChange(index, target.value);
    }
}

function onTableClick(event) {
    var target = event.target;
    var action = target.getAttribute('data-action');
    var index = Number(target.getAttribute('data-index'));

    if (action === 'remove') {
        handleRemove(index);
        return;
    }

    if (action === 'reset') {
        handleReset(index);
    }
}

function onModeButtonClick(event) {
    var btn = event.currentTarget;
    var mode = btn.getAttribute('data-mode-dispatch');
    if (!mode) {
        return;
    }
    handleSimulate(mode);
}

function init() {
    showEmptyState();
    setActiveModeButton(state.modeDispatch);

    if (elements.modeButtons && elements.modeButtons.length > 0) {
        for (var i = 0; i < elements.modeButtons.length; i++) {
            elements.modeButtons[i].addEventListener('click', onModeButtonClick);
        }
    }
    if (elements.validateBtn) {
        elements.validateBtn.addEventListener('click', handleValidate);
    }
    if (elements.resetDataBtn) {
        elements.resetDataBtn.addEventListener('click', handleResetData);
    }
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', handleCancel);
    }
    if (elements.resultsTableBody) {
        elements.resultsTableBody.addEventListener('input', onTableInput);
        elements.resultsTableBody.addEventListener('change', onTableChange);
        elements.resultsTableBody.addEventListener('click', onTableClick);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
