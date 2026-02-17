var state = {
    draftRows: [],
    eligibleCitiesByType: {},
    needRemainings: {},
    summary: null
};

var elements = {
    simulateBtn: document.getElementById('simulateBtn'),
    validateBtn: document.getElementById('validateBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    emptyState: document.getElementById('emptyState'),
    noResultsState: document.getElementById('noResultsState'),
    simulationResults: document.getElementById('simulationResults'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsTableBody: document.getElementById('resultsTableBody'),
    summaryBlock: document.getElementById('summaryBlock'),
    toast: document.getElementById('toast'),
    toastTitle: document.getElementById('toastTitle'),
    toastDescription: document.getElementById('toastDescription')
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
    if (isError) {
        elements.toast.style.background = 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)';
    } else {
        elements.toast.style.background = 'linear-gradient(135deg, #27AE60 0%, #229954 100%)';
    }
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

function getUsedDonQuantities() {
    var map = {};
    for (var i = 0; i < state.draftRows.length; i++) {
        var row = state.draftRows[i];
        if (map[row.id_don]) {
            map[row.id_don] = map[row.id_don] + row.quantite_proposee;
        } else {
            map[row.id_don] = row.quantite_proposee;
        }
    }
    return map;
}

function getDonLimitById(idDon) {
    if (!state.summary || !state.summary.dons) {
        return 0;
    }
    for (var i = 0; i < state.summary.dons.length; i++) {
        if (Number(state.summary.dons[i].id_don) === Number(idDon)) {
            var total = Number(state.summary.dons[i].quantite_totale || 0);
            var alreadyUsed = Number(state.summary.dons[i].quantite_deja_utilisee || 0);
            return Math.max(total - alreadyUsed, 0);
        }
    }
    return 0;
}

function renderTable() {
    elements.resultsTitle.textContent = 'Résultats (brouillon) - ' + state.draftRows.length + ' distribution(s)';
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
        selectVille.style.minWidth = '180px';
        selectVille.style.padding = '0.4rem';
        
        var cities = state.eligibleCitiesByType[row.id_type];
        if (!cities) cities = [];
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
        inputQte.style.width = '120px';
        inputQte.style.padding = '0.4rem';
        
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

function renderSummary() {
    var usedByDon = getUsedDonQuantities();
    var totalQuantity = 0;
    for (var i = 0; i < state.draftRows.length; i++) {
        totalQuantity = totalQuantity + Number(state.draftRows[i].quantite_proposee);
    }
    
    var distinctDonSet = {};
    for (var i = 0; i < state.draftRows.length; i++) {
        distinctDonSet[state.draftRows[i].id_don] = true;
    }
    var distinctDon = 0;
    for (var key in distinctDonSet) {
        distinctDon = distinctDon + 1;
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
    for (var i = 0; i < dons.length; i++) {
        var don = dons[i];
        var draftUsed = Number(usedByDon[don.id_don] || 0);
        var alreadyUsed = Number(don.quantite_deja_utilisee || 0);
        var total = Number(don.quantite_totale);
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

function rerenderDraft() {
    if (state.draftRows.length === 0) {
        showNoResultsState();
        return;
    }
    renderTable();
    renderSummary();
    showSimulationResults();
}

function handleSimulate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl('api/dispatch/simulate'), true);
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                var data = response.data;
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
            showToast('Erreur', 'Erreur HTTP ' + xhr.status, true);
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
        showToast('Validation', 'La somme distribuée dépasse la quantité du don.', true);
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
                showEmptyState();
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
    
    var payload = JSON.stringify({ distributions: state.draftRows });
    xhr.send(payload);
}

function handleCancel() {
    state.draftRows = [];
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
    }
}

function init() {
    showEmptyState();
    
    if (elements.simulateBtn) {
        elements.simulateBtn.addEventListener('click', handleSimulate);
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