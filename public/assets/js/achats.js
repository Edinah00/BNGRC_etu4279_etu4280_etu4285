const state = {
  meta: { argent_total_dons: 0, argent_utilise: 0, argent_disponible: 0, taux_frais: 10 },
  needs: [],
  history: [],
  historySummary: { total_ht: 0, total_frais: 0, total_ttc: 0, nb_achats: 0 },
  villes: [],
  types: [],
  filterVille: 'all',
  filterType: 'all',
  filterPeriod: 'all',
};

const elements = {
  moneyAvailable: document.getElementById('moneyAvailable'),
  moneyUsed: document.getElementById('moneyUsed'),
  moneyTotal: document.getElementById('moneyTotal'),
  inputFeeRate: document.getElementById('inputFeeRate'),
  saveFeeBtn: document.getElementById('saveFeeBtn'),
  filterVille: document.getElementById('filterVille'),
  filterType: document.getElementById('filterType'),
  filterPeriod: document.getElementById('filterPeriod'),
  refreshBtn: document.getElementById('refreshBtn'),
  needsBody: document.getElementById('needsBody'),
  historyBody: document.getElementById('historyBody'),
  historySummary: document.getElementById('historySummary'),
};

function escapeHtml(v){return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmt(n){return Number(n||0).toLocaleString('fr-FR',{maximumFractionDigits:2});}
function fmtAr(n){return `${fmt(n)} Ar`;}

async function api(url, options={}) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `HTTP ${response.status}`);
  }

  return payload;
}

function currentQueryString() {
  const params = new URLSearchParams();
  if (state.filterVille !== 'all') params.set('ville_id', state.filterVille);
  if (state.filterType !== 'all') params.set('type_id', state.filterType);
  if (state.filterPeriod !== 'all') params.set('periode', state.filterPeriod);
  return params.toString();
}

async function loadData() {
  const qs = currentQueryString();
  const payload = await api(`/api/achats${qs ? `?${qs}` : ''}`);
  const data = payload.data || {};

  state.meta = data.meta || state.meta;
  state.needs = data.needs || [];
  state.history = data.history || [];
  state.historySummary = data.history_summary || state.historySummary;
  state.villes = data.villes || [];
  state.types = data.types || [];

  renderFilters();
  renderMeta();
  renderNeeds();
  renderHistorySummary();
  renderHistory();
}

function renderFilters() {
  const villesOptions = state.villes
    .map((v) => `<option value="${v.id}">${escapeHtml(v.nom)}</option>`)
    .join('');

  const typesOptions = state.types
    .map((t) => `<option value="${t.id}">${escapeHtml(t.libelle)}</option>`)
    .join('');

  elements.filterVille.innerHTML = `<option value="all">Toutes les villes</option>${villesOptions}`;
  elements.filterType.innerHTML = `<option value="all">Tous les types</option>${typesOptions}`;

  elements.filterVille.value = state.filterVille;
  elements.filterType.value = state.filterType;
  elements.filterPeriod.value = state.filterPeriod;
}

function renderMeta() {
  elements.moneyAvailable.textContent = fmtAr(state.meta.argent_disponible);
  elements.moneyUsed.textContent = fmtAr(state.meta.argent_utilise);
  elements.moneyTotal.textContent = fmtAr(state.meta.argent_total_dons);
  elements.inputFeeRate.value = Number(state.meta.taux_frais || 0).toFixed(2);
}

function renderNeeds() {
  if (!state.needs.length) {
    elements.needsBody.innerHTML = '<tr><td colspan="7" class="empty-row">Aucun besoin achetable</td></tr>';
    return;
  }

  elements.needsBody.innerHTML = state.needs.map((n) => {
    const blockedByDon = Number(n.achat_bloque) === 1 || n.achat_bloque === true;
    const blockedByBudget = Number(n.achat_possible_budget) === 0 || n.achat_possible_budget === false;

    let status = '';
    if (blockedByDon) {
      status = `<div class="blocked-msg">❌ Don existant: ${fmt(n.don_restant_type)} disponible</div>`;
    } else if (blockedByBudget) {
      status = '<div class="warning-msg">⚠️ Budget insuffisant pour la quantité maximale. Réduisez la quantité.</div>';
    }

    const actionCell = blockedByDon
      ? `${status}`
      : `<div class="buy-actions">
            <input type="number" min="0.01" max="${n.quantite_restante}" step="0.01" value="${n.quantite_restante}" data-action="qty" data-id="${n.id_besoin}">
            <button class="btn-primary" data-action="buy" data-id="${n.id_besoin}">Acheter</button>
            ${status}
         </div>`;

    return `<tr>
      <td>${escapeHtml(n.ville)}</td>
      <td>${escapeHtml(n.nom_produit)}</td>
      <td>${escapeHtml(n.type_besoin)}</td>
      <td>${fmt(n.quantite_restante)}</td>
      <td>${fmtAr(n.prix_unitaire)}</td>
      <td>${fmtAr(n.montant_ttc)}</td>
      <td>${actionCell}</td>
    </tr>`;
  }).join('');
}

function renderHistorySummary() {
  const s = state.historySummary;
  elements.historySummary.innerHTML = `
    <div>Total HT: <strong>${fmtAr(s.total_ht)}</strong></div>
    <div>Total frais: <strong>${fmtAr(s.total_frais)}</strong></div>
    <div>Total TTC: <strong>${fmtAr(s.total_ttc)}</strong></div>
    <div>Achats: <strong>${fmt(s.nb_achats)}</strong></div>
  `;
}

function renderHistory() {
  if (!state.history.length) {
    elements.historyBody.innerHTML = '<tr><td colspan="7" class="empty-row">Aucun achat</td></tr>';
    return;
  }

  elements.historyBody.innerHTML = state.history.map((h) => {
    const date = new Date(h.date_achat);
    return `<tr>
      <td>${date.toLocaleString('fr-FR')}</td>
      <td>${escapeHtml(h.ville)}</td>
      <td>${escapeHtml(h.nom_produit)}</td>
      <td>${fmt(h.quantite)}</td>
      <td>${fmtAr(h.montant_ht)}</td>
      <td>${fmtAr(h.montant_frais)}</td>
      <td>${fmtAr(h.montant_ttc)}</td>
    </tr>`;
  }).join('');
}

async function handleSaveFee() {
  const rate = Number(elements.inputFeeRate.value || 0);
  if (Number.isNaN(rate) || rate < 0 || rate > 100) {
    alert('Le taux de frais doit être entre 0 et 100.');
    return;
  }

  try {
    await api('/api/achats/configuration/frais', {
      method: 'PUT',
      body: JSON.stringify({ taux_frais: rate }),
    });
    await loadData();
    alert('Taux de frais mis à jour.');
  } catch (error) {
    alert(error.message);
  }
}

function findQtyInputForNeed(needId) {
  return elements.needsBody.querySelector(`input[data-action="qty"][data-id="${needId}"]`);
}

async function handleBuy(needId) {
  const input = findQtyInputForNeed(needId);
  const qty = Number(input?.value || 0);

  if (!qty || qty <= 0) {
    alert('Quantité invalide.');
    return;
  }

  try {
    const payload = await api('/api/achats', {
      method: 'POST',
      body: JSON.stringify({ id_besoin: Number(needId), quantite: qty }),
    });

    alert(payload.message || 'Achat effectué.');
    await loadData();
  } catch (error) {
    alert(error.message);
  }
}

function bindEvents() {
  elements.filterVille?.addEventListener('change', async (e) => {
    state.filterVille = e.target.value;
    await loadData();
  });

  elements.filterType?.addEventListener('change', async (e) => {
    state.filterType = e.target.value;
    await loadData();
  });

  elements.filterPeriod?.addEventListener('change', async (e) => {
    state.filterPeriod = e.target.value;
    await loadData();
  });

  elements.refreshBtn?.addEventListener('click', async () => {
    await loadData();
  });

  elements.saveFeeBtn?.addEventListener('click', handleSaveFee);

  elements.needsBody?.addEventListener('click', async (event) => {
    const target = event.target;
    const action = target?.getAttribute?.('data-action');
    const id = target?.getAttribute?.('data-id');
    if (action === 'buy' && id) {
      await handleBuy(id);
    }
  });
}

function init() {
  bindEvents();
  loadData().catch((error) => {
    elements.needsBody.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
  });
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
