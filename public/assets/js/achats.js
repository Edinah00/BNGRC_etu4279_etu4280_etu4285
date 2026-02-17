var state = {
  meta: { argent_total_dons: 0, argent_utilise: 0, argent_disponible: 0, taux_frais: 10 },
  needs: [],
  history: [],
  historySummary: { total_ht: 0, total_frais: 0, total_ttc: 0, nb_achats: 0 },
  villes: [],
  types: [],
  filterVille: 'all',
  filterType: 'all',
  filterPeriod: 'all'
};

var elements = {
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
  historySummary: document.getElementById('historySummary')
};

function fmt(n){
    return Number(n||0).toLocaleString('fr-FR',{maximumFractionDigits:2});
}

function fmtAr(n){
    return fmt(n) + ' Ar';
}

function currentQueryString() {
  var params = new URLSearchParams();
  if (state.filterVille !== 'all') params.set('ville_id', state.filterVille);
  if (state.filterType !== 'all') params.set('type_id', state.filterType);
  if (state.filterPeriod !== 'all') params.set('periode', state.filterPeriod);
  return params.toString();
}

function loadData() {
  var qs = currentQueryString();
  var url = '/api/achats';
  if (qs) url = url + '?' + qs;
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.success && response.data) {
        var data = response.data;
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
    }
  };
  
  xhr.send();
}

function renderFilters() {
    elements.filterVille.textContent = '';
    elements.filterType.textContent = '';
    
    var allVillesOpt = document.createElement('option');
    allVillesOpt.value = 'all';
    allVillesOpt.textContent = 'Toutes les villes';
    elements.filterVille.appendChild(allVillesOpt);
    
    for (var i = 0; i < state.villes.length; i++) {
        var v = state.villes[i];
        var opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.nom;
        elements.filterVille.appendChild(opt);
    }
    
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
    elements.needsBody.textContent = '';
    
    if (state.needs.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'empty-row';
        td.textContent = 'Aucun besoin achetable';
        tr.appendChild(td);
        elements.needsBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < state.needs.length; i++) {
        var n = state.needs[i];
        var tr = document.createElement('tr');
        
        var tdVille = document.createElement('td');
        tdVille.textContent = n.ville;
        
        var tdProduit = document.createElement('td');
        tdProduit.textContent = n.nom_produit;
        
        var tdType = document.createElement('td');
        tdType.textContent = n.type_besoin;
        
        var tdQte = document.createElement('td');
        tdQte.textContent = fmt(n.quantite_restante);
        
        var tdPrix = document.createElement('td');
        tdPrix.textContent = fmtAr(n.prix_unitaire);
        
        var tdMontant = document.createElement('td');
        tdMontant.textContent = fmtAr(n.montant_ttc);
        
        var tdAction = document.createElement('td');
        
        var blockedByDon = Number(n.achat_bloque) === 1 || n.achat_bloque === true;
        var blockedByBudget = Number(n.achat_possible_budget) === 0 || n.achat_possible_budget === false;
        
        if (blockedByDon) {
            var div = document.createElement('div');
            div.className = 'blocked-msg';
            div.textContent = 'Don existant: ' + fmt(n.don_restant_type) + ' disponible';
            tdAction.appendChild(div);
        } else {
            var div = document.createElement('div');
            div.className = 'buy-actions';
            
            var input = document.createElement('input');
            input.type = 'number';
            input.min = '0.01';
            input.max = n.quantite_restante;
            input.step = '0.01';
            input.value = n.quantite_restante;
            input.dataset.action = 'qty';
            input.dataset.id = n.id_besoin;
            
            var btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.dataset.action = 'buy';
            btn.dataset.id = n.id_besoin;
            btn.textContent = 'Acheter';
            
            div.appendChild(input);
            div.appendChild(btn);
            
            if (blockedByBudget) {
                var warning = document.createElement('div');
                warning.className = 'warning-msg';
                warning.textContent = 'Budget insuffisant pour la quantité maximale. Réduisez la quantité.';
                div.appendChild(warning);
            }
            
            tdAction.appendChild(div);
        }
        
        tr.appendChild(tdVille);
        tr.appendChild(tdProduit);
        tr.appendChild(tdType);
        tr.appendChild(tdQte);
        tr.appendChild(tdPrix);
        tr.appendChild(tdMontant);
        tr.appendChild(tdAction);
        
        elements.needsBody.appendChild(tr);
    }
}

function renderHistorySummary() {
  var s = state.historySummary;
  elements.historySummary.textContent = '';
  
  var divHt = document.createElement('div');
  divHt.textContent = 'Total HT: ';
  var strongHt = document.createElement('strong');
  strongHt.textContent = fmtAr(s.total_ht);
  divHt.appendChild(strongHt);
  
  var divFrais = document.createElement('div');
  divFrais.textContent = 'Total frais: ';
  var strongFrais = document.createElement('strong');
  strongFrais.textContent = fmtAr(s.total_frais);
  divFrais.appendChild(strongFrais);
  
  var divTtc = document.createElement('div');
  divTtc.textContent = 'Total TTC: ';
  var strongTtc = document.createElement('strong');
  strongTtc.textContent = fmtAr(s.total_ttc);
  divTtc.appendChild(strongTtc);
  
  var divAchats = document.createElement('div');
  divAchats.textContent = 'Achats: ';
  var strongAchats = document.createElement('strong');
  strongAchats.textContent = fmt(s.nb_achats);
  divAchats.appendChild(strongAchats);
  
  elements.historySummary.appendChild(divHt);
  elements.historySummary.appendChild(divFrais);
  elements.historySummary.appendChild(divTtc);
  elements.historySummary.appendChild(divAchats);
}

function renderHistory() {
    elements.historyBody.textContent = '';
    
    if (state.history.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'empty-row';
        td.textContent = 'Aucun achat';
        tr.appendChild(td);
        elements.historyBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < state.history.length; i++) {
        var h = state.history[i];
        var tr = document.createElement('tr');
        var date = new Date(h.date_achat);
        
        var tdDate = document.createElement('td');
        tdDate.textContent = date.toLocaleString('fr-FR');
        
        var tdVille = document.createElement('td');
        tdVille.textContent = h.ville;
        
        var tdProduit = document.createElement('td');
        tdProduit.textContent = h.nom_produit;
        
        var tdQte = document.createElement('td');
        tdQte.textContent = fmt(h.quantite);
        
        var tdHt = document.createElement('td');
        tdHt.textContent = fmtAr(h.montant_ht);
        
        var tdFrais = document.createElement('td');
        tdFrais.textContent = fmtAr(h.montant_frais);
        
        var tdTtc = document.createElement('td');
        tdTtc.textContent = fmtAr(h.montant_ttc);
        
        tr.appendChild(tdDate);
        tr.appendChild(tdVille);
        tr.appendChild(tdProduit);
        tr.appendChild(tdQte);
        tr.appendChild(tdHt);
        tr.appendChild(tdFrais);
        tr.appendChild(tdTtc);
        
        elements.historyBody.appendChild(tr);
    }
}

function handleSaveFee() {
  var rate = Number(elements.inputFeeRate.value || 0);
  
  var xhr = new XMLHttpRequest();
  xhr.open('PUT', '/api/achats/configuration/frais', true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      alert('Taux de frais mis à jour.');
      loadData();
    } else {
      alert('Erreur lors de la mise à jour.');
    }
  };
  
  xhr.send(JSON.stringify({ taux_frais: rate }));
}

function handleBuy(needId) {
  var input = elements.needsBody.querySelector('input[data-action="qty"][data-id="' + needId + '"]');
  if (!input) return;
  
  var qty = Number(input.value);
  if (!qty || qty <= 0) {
    alert('Quantité invalide.');
    return;
  }
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/achats', true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      alert(response.message || 'Achat effectué.');
      loadData();
    } else {
      alert('Erreur lors de l achat.');
    }
  };
  
  xhr.send(JSON.stringify({ id_besoin: Number(needId), quantite: qty }));
}

function onFilterVilleChange(event) {
    state.filterVille = event.target.value;
    loadData();
}

function onFilterTypeChange(event) {
    state.filterType = event.target.value;
    loadData();
}

function onFilterPeriodChange(event) {
    state.filterPeriod = event.target.value;
    loadData();
}

function onRefreshClick() {
    loadData();
}

function onNeedsBodyClick(event) {
    var target = event.target;
    if (!target) return;
    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');
    if (action === 'buy' && id) {
      handleBuy(id);
    }
}

function init() {
  if (elements.filterVille) {
      elements.filterVille.addEventListener('change', onFilterVilleChange);
  }
  if (elements.filterType) {
      elements.filterType.addEventListener('change', onFilterTypeChange);
  }
  if (elements.filterPeriod) {
      elements.filterPeriod.addEventListener('change', onFilterPeriodChange);
  }
  if (elements.refreshBtn) {
      elements.refreshBtn.addEventListener('click', onRefreshClick);
  }
  if (elements.saveFeeBtn) {
      elements.saveFeeBtn.addEventListener('click', handleSaveFee);
  }
  if (elements.needsBody) {
      elements.needsBody.addEventListener('click', onNeedsBodyClick);
  }
  
  loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
