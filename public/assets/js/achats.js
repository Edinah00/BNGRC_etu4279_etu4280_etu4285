var state = {
  meta: { argent_total_dons: 0, argent_utilise: 0, argent_disponible: 0, taux_frais: 10 },
  needs: [],
  types: [],
  history: [],
  historySummary: { total_ht: 0, total_frais: 0, total_ttc: 0, nb_achats: 0 },
  filterType: 'all',
  filterPeriod: 'all'
};

var elements = {
  moneyAvailable: document.getElementById('moneyAvailable'),
  moneyUsed: document.getElementById('moneyUsed'),
  moneyTotal: document.getElementById('moneyTotal'),
  inputFeeRate: document.getElementById('inputFeeRate'),
  saveFeeBtn: document.getElementById('saveFeeBtn'),
  filterType: document.getElementById('filterType'),
  refreshBtn: document.getElementById('refreshBtn'),
  needsBody: document.getElementById('needsBody'),
  buyType: document.getElementById('buyType'),
  buyQty: document.getElementById('buyQty'),
  buySubmitBtn: document.getElementById('buySubmitBtn'),
  buyFormHint: document.getElementById('buyFormHint'),
  purchaseFormSection: document.getElementById('purchaseFormSection'),
  filterPeriod: document.getElementById('filterPeriod'),
  historyTotalHt: document.getElementById('historyTotalHt'),
  historyTotalFrais: document.getElementById('historyTotalFrais'),
  historyTotalTtc: document.getElementById('historyTotalTtc'),
  historyCount: document.getElementById('historyCount'),
  historyBody: document.getElementById('historyBody')
};

function fmt(n) {
  return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function fmtAr(n) {
  return fmt(n) + ' Ar';
}

function currentQueryString() {
  var params = new URLSearchParams();
  if (state.filterType !== 'all') {
    params.set('type_id', state.filterType);
  }
  if (state.filterPeriod !== 'all') {
    params.set('periode', state.filterPeriod);
  }
  return params.toString();
}

function loadData() {
  var qs = currentQueryString();
  var url = '/api/achats';
  if (qs) {
    url = url + '?' + qs;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function() {
    if (xhr.status !== 200) {
      return;
    }

    var response = JSON.parse(xhr.responseText);
    if (!response.success || !response.data) {
      return;
    }

    state.meta = response.data.meta || state.meta;
    state.needs = response.data.needs || [];
    state.types = response.data.types || [];
    state.history = response.data.history || [];
    state.historySummary = response.data.history_summary || state.historySummary;

    renderMeta();
    renderFilters();
    renderBuyTypeOptions();
    renderNeeds();
    renderHistorySummary();
    renderHistory();
  };

  xhr.send();
}

function renderMeta() {
  if (elements.moneyAvailable) {
    elements.moneyAvailable.textContent = fmtAr(state.meta.argent_disponible);
  }
  if (elements.moneyUsed) {
    elements.moneyUsed.textContent = fmtAr(state.meta.argent_utilise);
  }
  if (elements.moneyTotal) {
    elements.moneyTotal.textContent = fmtAr(state.meta.argent_total_dons);
  }
  if (elements.inputFeeRate) {
    elements.inputFeeRate.value = Number(state.meta.taux_frais || 0).toFixed(2);
  }
}

function renderFilters() {
  if (!elements.filterType) {
    return;
  }

  elements.filterType.textContent = '';

  var allTypesOpt = document.createElement('option');
  allTypesOpt.value = 'all';
  allTypesOpt.textContent = 'Tous les types';
  elements.filterType.appendChild(allTypesOpt);

  for (var i = 0; i < state.types.length; i++) {
    var t = state.types[i];
    var opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.libelle;
    elements.filterType.appendChild(opt);
  }

  elements.filterType.value = state.filterType;
  if (elements.filterPeriod) {
    elements.filterPeriod.value = state.filterPeriod;
  }
}

function renderBuyTypeOptions() {
  if (!elements.buyType) {
    return;
  }

  var selected = elements.buyType.value;
  elements.buyType.textContent = '';

  var placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Choisir un type';
  elements.buyType.appendChild(placeholder);

  for (var i = 0; i < state.types.length; i++) {
    var t = state.types[i];
    var opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.libelle;
    elements.buyType.appendChild(opt);
  }

  if (selected) {
    elements.buyType.value = selected;
  }
}

function buildStatusCell(need) {
  var tdStatus = document.createElement('td');
  var status = document.createElement('span');
  var code = need.status || '';

  status.className = 'status-pill';

  if (code === 'dons_existants') {
    status.className += ' status-warning';
    status.textContent = 'Dons existants';
  } else if (code === 'satisfait') {
    status.className += ' status-ok';
    status.textContent = 'Satisfait';
  } else {
    status.className += ' status-danger';
    status.textContent = 'A acheter';
  }

  tdStatus.appendChild(status);
  return tdStatus;
}

function buildActionCell(need) {
  var tdAction = document.createElement('td');
  var btn = document.createElement('button');
  btn.className = 'btn-primary btn-buy-row';
  btn.type = 'button';
  btn.textContent = 'Acheter';
  btn.setAttribute('data-action', 'goto-buy-form');
  btn.setAttribute('data-type-id', need.id_type);
  btn.setAttribute('data-qty', need.quantite_restante);

  if (need.status !== 'a_acheter') {
    btn.disabled = true;
  }

  tdAction.appendChild(btn);
  return tdAction;
}

function renderNeeds() {
  if (!elements.needsBody) {
    return;
  }

  elements.needsBody.textContent = '';

  if (state.needs.length === 0) {
    var trEmpty = document.createElement('tr');
    var tdEmpty = document.createElement('td');
    tdEmpty.colSpan = 6;
    tdEmpty.className = 'empty-row';
    tdEmpty.textContent = 'Aucun besoin trouvé';
    trEmpty.appendChild(tdEmpty);
    elements.needsBody.appendChild(trEmpty);
    return;
  }

  for (var i = 0; i < state.needs.length; i++) {
    var n = state.needs[i];
    var tr = document.createElement('tr');

    var tdType = document.createElement('td');
    tdType.textContent = n.type_besoin;

    var tdTotal = document.createElement('td');
    tdTotal.textContent = fmt(n.quantite_totale);

    var tdRestant = document.createElement('td');
    tdRestant.textContent = fmt(n.quantite_restante);

    var tdDonRestant = document.createElement('td');
    tdDonRestant.textContent = fmt(n.don_restant_type);

    tr.appendChild(tdType);
    tr.appendChild(tdTotal);
    tr.appendChild(tdRestant);
    tr.appendChild(tdDonRestant);
    tr.appendChild(buildStatusCell(n));
    tr.appendChild(buildActionCell(n));

    elements.needsBody.appendChild(tr);
  }
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  var date = new Date(value);
  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderHistorySummary() {
  var summary = state.historySummary || {};

  if (elements.historyTotalHt) {
    elements.historyTotalHt.textContent = fmtAr(summary.total_ht);
  }
  if (elements.historyTotalFrais) {
    elements.historyTotalFrais.textContent = fmtAr(summary.total_frais);
  }
  if (elements.historyTotalTtc) {
    elements.historyTotalTtc.textContent = fmtAr(summary.total_ttc);
  }
  if (elements.historyCount) {
    elements.historyCount.textContent = String(summary.nb_achats || 0);
  }
}

function renderHistory() {
  if (!elements.historyBody) {
    return;
  }

  elements.historyBody.textContent = '';

  if (!state.history || state.history.length === 0) {
    var trEmpty = document.createElement('tr');
    var tdEmpty = document.createElement('td');
    tdEmpty.colSpan = 7;
    tdEmpty.className = 'empty-row';
    tdEmpty.textContent = 'Aucun achat';
    trEmpty.appendChild(tdEmpty);
    elements.historyBody.appendChild(trEmpty);
    return;
  }

  for (var i = 0; i < state.history.length; i++) {
    var row = state.history[i];
    var tr = document.createElement('tr');

    var tdDate = document.createElement('td');
    tdDate.textContent = formatDateTime(row.date_achat);
    tr.appendChild(tdDate);

    var tdVille = document.createElement('td');
    tdVille.textContent = row.ville || '-';
    tr.appendChild(tdVille);

    var tdProduit = document.createElement('td');
    tdProduit.textContent = row.nom_produit || (row.type_besoin || '-');
    tr.appendChild(tdProduit);

    var tdQte = document.createElement('td');
    tdQte.textContent = fmt(row.quantite);
    tr.appendChild(tdQte);

    var tdHt = document.createElement('td');
    tdHt.textContent = fmtAr(row.montant_ht);
    tr.appendChild(tdHt);

    var tdFrais = document.createElement('td');
    tdFrais.textContent = fmtAr(row.montant_frais);
    tr.appendChild(tdFrais);

    var tdTtc = document.createElement('td');
    tdTtc.textContent = fmtAr(row.montant_ttc);
    tr.appendChild(tdTtc);

    elements.historyBody.appendChild(tr);
  }
}

function focusBuyForm(typeId, qty) {
  if (elements.buyType) {
    elements.buyType.value = String(typeId);
  }
  if (elements.buyQty) {
    elements.buyQty.value = Number(qty || 0).toFixed(2);
    elements.buyQty.focus();
  }
  if (elements.purchaseFormSection) {
    elements.purchaseFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setHint(msg, isError) {
  if (!elements.buyFormHint) {
    return;
  }
  elements.buyFormHint.textContent = msg;
  elements.buyFormHint.className = isError ? 'hint hint-error' : 'hint hint-success';
}

function submitBuyForm() {
  if (!elements.buyType || !elements.buyQty) {
    return;
  }

  var idType = Number(elements.buyType.value || 0);
  var qty = Number(elements.buyQty.value || 0);

  if (!idType || qty <= 0) {
    setHint('Veuillez sélectionner un type et saisir une quantité valide.', true);
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/achats/type', true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function() {
    var response;
    try {
      response = JSON.parse(xhr.responseText || '{}');
    } catch (e) {
      response = {};
    }

    if (xhr.status === 200 && response.success) {
      setHint(response.message || 'Achat effectué avec succès.', false);
      elements.buyQty.value = '';
      loadData();
      return;
    }

    setHint(response.message || 'Erreur lors de l\'achat.', true);
  };

  xhr.send(JSON.stringify({ id_type: idType, quantite: qty }));
}

function saveFeeRate() {
  if (!elements.inputFeeRate) {
    return;
  }

  var rate = Number(elements.inputFeeRate.value || 0);
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', '/api/achats/configuration/frais', true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function() {
    var response;
    try {
      response = JSON.parse(xhr.responseText || '{}');
    } catch (e) {
      response = {};
    }

    if (xhr.status === 200 && response.success) {
      loadData();
      return;
    }

    alert(response.message || 'Erreur lors de la mise à jour des frais.');
  };

  xhr.send(JSON.stringify({ taux_frais: rate }));
}

function onFilterTypeChange(event) {
  state.filterType = event.target.value;
  loadData();
}

function onRefreshClick() {
  loadData();
}

function onFilterPeriodChange(event) {
  state.filterPeriod = event.target.value || 'all';
  loadData();
}

function onNeedsBodyClick(event) {
  var target = event.target;
  if (!target) {
    return;
  }

  var action = target.getAttribute('data-action');
  if (action !== 'goto-buy-form') {
    return;
  }

  var typeId = target.getAttribute('data-type-id');
  var qty = target.getAttribute('data-qty');
  if (!typeId) {
    return;
  }

  focusBuyForm(typeId, qty);
}

function init() {
  if (elements.filterType) {
    elements.filterType.addEventListener('change', onFilterTypeChange);
  }

  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener('click', onRefreshClick);
  }
  if (elements.filterPeriod) {
    elements.filterPeriod.addEventListener('change', onFilterPeriodChange);
  }

  if (elements.needsBody) {
    elements.needsBody.addEventListener('click', onNeedsBodyClick);
  }

  if (elements.buySubmitBtn) {
    elements.buySubmitBtn.addEventListener('click', submitBuyForm);
  }
  if (elements.saveFeeBtn) {
    elements.saveFeeBtn.addEventListener('click', saveFeeRate);
  }

  loadData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
