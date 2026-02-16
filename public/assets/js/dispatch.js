const state = {
    draftRows: [],
    eligibleCitiesByType: {},
    needRemainings: {},
    summary: null,
};

const elements = {
    simulateBtn: document.getElementById('simulateBtn'),
    validateBtn: document.getElementById('validateBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    emptyState: document.getElementById('emptyState'),
    noResultsState: document.getElementById('noResultsState'),
    simulationResults: document.getElementById('simulationResults'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsTableBody: document.getElementById('resultsTableBody'),
    summaryBlock: document.getElementById('summaryBlock'),
    toast: document.getElementById('toast'),
    toastTitle: document.getElementById('toastTitle'),
    toastDescription: document.getElementById('toastDescription'),
};

function showEmptyState() {
    elements.emptyState.style.display = 'block';
    elements.noResultsState.style.display = 'none';
    elements.simulationResults.style.display = 'none';
}

function showNoResultsState() {
    elements.emptyState.style.display = 'none';
    elements.noResultsState.style.display = 'block';
    elements.simulationResults.style.display = 'none';
}

function showSimulationResults() {
    elements.emptyState.style.display = 'none';
    elements.noResultsState.style.display = 'none';
    elements.simulationResults.style.display = 'block';
}

function showToast(title, description, isError = false) {
    elements.toastTitle.textContent = title;
    elements.toastDescription.textContent = description;
    elements.toast.style.background = isError
        ? 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)'
        : 'linear-gradient(135deg, #27AE60 0%, #229954 100%)';
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3500);
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...options,
    });

    const raw = await response.text();
    let payload = null;
    try {
        payload = raw ? JSON.parse(raw) : null;
    } catch (error) {
        throw new Error(`Réponse non JSON (${response.status}) sur ${url}`);
    }

    if (!payload) {
        throw new Error(`Réponse vide (${response.status}) sur ${url}`);
    }

    if (!response.ok || !payload.success) {
        throw new Error(payload.message || `Erreur HTTP ${response.status}`);
    }

    return payload;
}

function apiUrl(path) {
    const cleanPath = String(path).replace(/^\/+/, '');
    const base = window.location.pathname.replace(/\/dispatch\/?$/, '/');
    return `${base}${cleanPath}`;
}

function recalculateNeedRemainings() {
    const base = { ...state.needRemainings };
    for (const row of state.draftRows) {
        const key = `${row.id_ville}-${row.id_type}`;
        const current = base[key] ?? 0;
        base[key] = current - row.quantite_proposee;
    }
    return base;
}

function getUsedDonQuantities() {
    const map = {};
    for (const row of state.draftRows) {
        map[row.id_don] = (map[row.id_don] || 0) + row.quantite_proposee;
    }
    return map;
}

function getDonLimitById(idDon) {
    if (!state.summary || !Array.isArray(state.summary.dons)) {
        return 0;
    }
    const found = state.summary.dons.find((d) => Number(d.id_don) === Number(idDon));
    return found ? Number(found.quantite_totale) : 0;
}

function getCityTypeRemainingForRow(targetIndex, cityId, typeId) {
    const key = `${cityId}-${typeId}`;
    const baseRemaining = Number(state.needRemainings[key] ?? 0);

    let usedByOtherRows = 0;
    state.draftRows.forEach((row, index) => {
        if (index === targetIndex) return;
        if (Number(row.id_ville) === Number(cityId) && Number(row.id_type) === Number(typeId)) {
            usedByOtherRows += Number(row.quantite_proposee || 0);
        }
    });

    return Math.max(baseRemaining - usedByOtherRows, 0);
}

function renderTable() {
    elements.resultsTitle.textContent = `Résultats (brouillon) - ${state.draftRows.length} distribution(s)`;

    const rowsHtml = state.draftRows.map((row, index) => {
        const cities = state.eligibleCitiesByType[row.id_type] || [];
        const cityOptions = cities.map((city) => {
            const selected = Number(city.id_ville) === Number(row.id_ville) ? 'selected' : '';
            const remain = Number(city.besoin_restant).toFixed(2);
            return `<option value="${city.id_ville}" ${selected}>${city.nom} (${remain})</option>`;
        }).join('');

        return `
            <tr data-index="${index}">
                <td>${row.don_label}</td>
                <td><span class="badge">${row.type_besoin}</span></td>
                <td>
                    <select data-action="city" data-index="${index}" style="min-width:180px;padding:0.4rem;">
                        ${cityOptions}
                    </select>
                </td>
                <td>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        max="${row.quantite_max_initiale}"
                        value="${row.quantite_proposee}"
                        data-action="quantity"
                        data-index="${index}"
                        style="width:120px;padding:0.4rem;"
                    />
                    <small style="display:block;opacity:0.7;">max initial: ${Number(row.quantite_max_initiale).toFixed(2)}</small>
                </td>
                <td>
                    <button type="button" data-action="remove" data-index="${index}" class="btn-primary" style="padding:0.4rem 0.7rem;background:#c0392b;">Supprimer</button>
                </td>
            </tr>
        `;
    }).join('');

    elements.resultsTableBody.innerHTML = rowsHtml;
}

function renderSummary() {
    const usedByDon = getUsedDonQuantities();
    const donRows = (state.summary?.dons || []).map((don) => {
        const used = Number(usedByDon[don.id_don] || 0);
        const total = Number(don.quantite_totale);
        const remain = Math.max(total - used, 0);
        const pct = total > 0 ? ((used / total) * 100).toFixed(2) : '0.00';
        return `
            <div style="border:1px solid #dfe6e9;border-radius:8px;padding:0.75rem;margin-bottom:0.6rem;">
                <strong>Don #${don.id_don} (${don.type_besoin})</strong><br>
                Distribué: ${used.toFixed(2)} (${pct}%)<br>
                Restant: ${remain.toFixed(2)}
            </div>
        `;
    }).join('');

    const totalQuantity = state.draftRows.reduce((sum, row) => sum + Number(row.quantite_proposee), 0);
    const distinctDon = new Set(state.draftRows.map((row) => row.id_don)).size;

    elements.summaryBlock.innerHTML = `
        <p>Nombre de distributions : <strong>${state.draftRows.length}</strong></p>
        <p>Dons utilisés : <strong>${distinctDon}</strong></p>
        <p>Quantité totale distribuée : <strong>${totalQuantity.toFixed(2)}</strong></p>
        <div style="margin-top:0.8rem;">${donRows}</div>
    `;
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

async function handleSimulate() {
    try {
        const payload = await requestJson(apiUrl('api/dispatch/simulate'));
        const data = payload.data;

        state.draftRows = data.distributions || [];
        state.eligibleCitiesByType = data.eligible_cities_by_type || {};
        state.needRemainings = data.need_remainings || {};
        state.summary = data.summary || null;

        if (state.draftRows.length === 0) {
            showNoResultsState();
            return;
        }

        rerenderDraft();
    } catch (error) {
        showToast('Erreur', error.message, true);
        showNoResultsState();
    }
}

function handleQuantityChange(index, value) {
    const row = state.draftRows[index];
    if (!row) return;

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
        showToast('Validation', 'La quantité doit être >= 0.', true);
        rerenderDraft();
        return;
    }

    if (parsed > Number(row.quantite_max_initiale)) {
        showToast('Validation', 'La quantité dépasse la proposition initiale.', true);
        rerenderDraft();
        return;
    }

    const previous = Number(row.quantite_proposee);
    row.quantite_proposee = parsed;

    const usedByDon = getUsedDonQuantities();
    if ((usedByDon[row.id_don] || 0) > getDonLimitById(row.id_don) + 0.00001) {
        row.quantite_proposee = previous;
        showToast('Validation', 'La somme distribuée dépasse la quantité du don.', true);
        rerenderDraft();
        return;
    }

    const needBalance = recalculateNeedRemainings();
    const needKey = `${row.id_ville}-${row.id_type}`;
    if ((needBalance[needKey] ?? 0) < -0.00001) {
        row.quantite_proposee = previous;
        showToast('Validation', 'La quantité dépasse le besoin restant de la ville.', true);
        rerenderDraft();
        return;
    }

    rerenderDraft();
}

function handleCityChange(index, idVille) {
    const row = state.draftRows[index];
    if (!row) return;

    const newCity = Number(idVille);
    row.id_ville = newCity;
    const maxForSelectedCity = getCityTypeRemainingForRow(index, row.id_ville, row.id_type);

    if (Number(row.quantite_proposee) > maxForSelectedCity) {
        row.quantite_proposee = Number(maxForSelectedCity.toFixed(2));
        showToast('Ajustement auto', 'Quantité réduite au besoin restant de la ville sélectionnée.');
    }

    rerenderDraft();
}

function handleRemove(index) {
    state.draftRows.splice(index, 1);
    rerenderDraft();
}

async function handleValidate() {
    if (state.draftRows.length === 0) {
        showToast('Validation', 'Aucune ligne à valider.', true);
        return;
    }

    try {
        const payload = await requestJson(apiUrl('api/dispatch/validate'), {
            method: 'POST',
            body: JSON.stringify({ distributions: state.draftRows }),
        });

        showToast('Succès', payload.message || 'Dispatch validé avec succès.');
        state.draftRows = [];
        showEmptyState();
    } catch (error) {
        showToast('Erreur', error.message, true);
    }
}

function handleCancel() {
    state.draftRows = [];
    showEmptyState();
}

function bindEvents() {
    if (elements.simulateBtn) {
        elements.simulateBtn.addEventListener('click', handleSimulate);
    }

    if (elements.validateBtn) {
        elements.validateBtn.addEventListener('click', handleValidate);
    }

    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', handleCancel);
    }

    if (elements.resultsTableBody) {
        elements.resultsTableBody.addEventListener('input', (event) => {
            const target = event.target;
            const action = target.getAttribute('data-action');
            const index = Number(target.getAttribute('data-index'));
            if (action === 'quantity') {
                handleQuantityChange(index, target.value);
            }
        });

        elements.resultsTableBody.addEventListener('change', (event) => {
            const target = event.target;
            const action = target.getAttribute('data-action');
            const index = Number(target.getAttribute('data-index'));
            if (action === 'city') {
                handleCityChange(index, target.value);
            }
        });

        elements.resultsTableBody.addEventListener('click', (event) => {
            const target = event.target;
            const action = target.getAttribute('data-action');
            const index = Number(target.getAttribute('data-index'));
            if (action === 'remove') {
                handleRemove(index);
            }
        });
    }
}

function init() {
    showEmptyState();
    bindEvents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
