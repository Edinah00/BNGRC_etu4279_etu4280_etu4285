var state = { besoins: [], villes: [], types: [], editing: null, filterVille: 'all', filterType: 'all' };
var elements = {
  addBtn: document.getElementById('addBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  modalTitle: document.getElementById('modalTitle'),
  tableBody: document.getElementById('tableBody'),
  filterVille: document.getElementById('filterVille'),
  filterType: document.getElementById('filterType'),
  inputVille: document.getElementById('inputVille'),
  inputType: document.getElementById('inputType'),
  inputDescription: document.getElementById('inputDescription'),
  inputQuantite: document.getElementById('inputQuantite'),
  inputPrix: document.getElementById('inputPrix')
};

function apiUrl(path) {
    var base = window.BASE_URL || '';
    var clean = String(path || '');
    if (clean.charAt(0) !== '/') {
        clean = '/' + clean;
    }
    return base + clean;
}

function fmt(n){
    return Number(n||0).toLocaleString('fr-FR');
}

function openModal(){
    elements.modalOverlay.classList.add('active');
}

function closeModal(){
    elements.modalOverlay.classList.remove('active');
    state.editing = null;
    elements.modalTitle.textContent = 'Ajouter un besoin';
    elements.inputVille.value = '';
    elements.inputType.value = '';
    elements.inputDescription.value = '';
    elements.inputQuantite.value = '';
    elements.inputPrix.value = '';
}

function populateSelects(){
    elements.inputVille.textContent = '';
    elements.filterVille.textContent = '';
    elements.inputType.textContent = '';
    elements.filterType.textContent = '';
    
    var defaultVilleOpt = document.createElement('option');
    defaultVilleOpt.value = '';
    defaultVilleOpt.textContent = 'Selectionner';
    elements.inputVille.appendChild(defaultVilleOpt);
    
    var allVillesOpt = document.createElement('option');
    allVillesOpt.value = 'all';
    allVillesOpt.textContent = 'Toutes les villes';
    elements.filterVille.appendChild(allVillesOpt);
    
    for (var i = 0; i < state.villes.length; i++) {
        var v = state.villes[i];
        var opt1 = document.createElement('option');
        opt1.value = v.id;
        opt1.textContent = v.nom;
        elements.inputVille.appendChild(opt1);
        
        var opt2 = document.createElement('option');
        opt2.value = v.id;
        opt2.textContent = v.nom;
        elements.filterVille.appendChild(opt2);
    }
    
    var allTypesOpt = document.createElement('option');
    allTypesOpt.value = 'all';
    allTypesOpt.textContent = 'Tous les types';
    elements.filterType.appendChild(allTypesOpt);
    
    for (var i = 0; i < state.types.length; i++) {
        var t = state.types[i];
        var opt1 = document.createElement('option');
        opt1.value = t.id;
        opt1.textContent = t.categorie || t.libelle;
        elements.inputType.appendChild(opt1);
        
        var opt2 = document.createElement('option');
        opt2.value = t.id;
        opt2.textContent = t.categorie || t.libelle;
        elements.filterType.appendChild(opt2);
    }
}

function filtered(){
    var result = [];
    for (var i = 0; i < state.besoins.length; i++) {
        var b = state.besoins[i];
        var matchVille = state.filterVille === 'all' || String(b.id_ville) === state.filterVille;
        var matchType = state.filterType === 'all' || String(b.id_type) === state.filterType;
        if (matchVille && matchType) {
            result.push(b);
        }
    }
    return result;
}

function renderTable(){
    var rows = filtered();
    elements.tableBody.textContent = '';
    
    if(rows.length === 0){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 9;
        td.className = 'empty-row';
        td.textContent = 'Aucun besoin';
        tr.appendChild(td);
        elements.tableBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < rows.length; i++) {
        var b = rows[i];
        var tr = document.createElement('tr');
        
        var tdVille = document.createElement('td');
        tdVille.textContent = b.ville || '—';
        
        var tdType = document.createElement('td');
        tdType.textContent = b.type || '—';
        
        var tdDesc = document.createElement('td');
        tdDesc.textContent = b.nom_produit || b.description || '';
        
        var tdQte = document.createElement('td');
        tdQte.textContent = fmt(b.quantite);

        var tdSatisfied = document.createElement('td');
        tdSatisfied.textContent = fmt(b.quantite_satisfaite);

        var tdRemaining = document.createElement('td');
        tdRemaining.textContent = fmt(b.quantite_restante);
        
        var tdPrix = document.createElement('td');
        tdPrix.textContent = fmt(b.prix_unitaire) + ' Ar';
        
        var tdTotal = document.createElement('td');
        tdTotal.style.fontWeight = '600';
        tdTotal.textContent = fmt(Number(b.quantite)*Number(b.prix_unitaire)) + ' Ar';
        
        var tdActions = document.createElement('td');
        var divActions = document.createElement('div');
        divActions.className = 'action-buttons';
        
        var btnEdit = document.createElement('button');
        btnEdit.className = 'action-btn edit-btn';
        btnEdit.dataset.id = b.id;
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', function() {
            var besoinId = this.dataset.id;
            var besoin = null;
            for (var j = 0; j < state.besoins.length; j++) {
                if (String(state.besoins[j].id) === besoinId) {
                    besoin = state.besoins[j];
                    break;
                }
            }
            if (!besoin) return;
            state.editing = besoin;
            elements.modalTitle.textContent = 'Modifier un besoin';
            elements.inputVille.value = besoin.id_ville;
            elements.inputType.value = besoin.id_type;
            elements.inputDescription.value = besoin.nom_produit || besoin.description || '';
            elements.inputQuantite.value = besoin.quantite;
            elements.inputPrix.value = besoin.prix_unitaire;
            openModal();
        });
        
        var btnDelete = document.createElement('button');
        btnDelete.className = 'action-btn delete-btn delete';
        btnDelete.dataset.id = b.id;
        btnDelete.textContent = 'Del';
        btnDelete.addEventListener('click', function() {
            if (!confirm('Supprimer ce besoin ?')) return;
            
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', apiUrl('/api/besoins/' + this.dataset.id), true);
            xhr.setRequestHeader('Accept', 'application/json');
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    loadData();
                } else {
                    alert('Erreur lors de la suppression.');
                }
            };
            
            xhr.send();
        });
        
        divActions.appendChild(btnEdit);
        divActions.appendChild(btnDelete);
        tdActions.appendChild(divActions);
        
        tr.appendChild(tdVille);
        tr.appendChild(tdType);
        tr.appendChild(tdDesc);
        tr.appendChild(tdQte);
        tr.appendChild(tdSatisfied);
        tr.appendChild(tdRemaining);
        tr.appendChild(tdPrix);
        tr.appendChild(tdTotal);
        tr.appendChild(tdActions);
        
        elements.tableBody.appendChild(tr);
    }
}

function loadData(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiUrl('/api/besoins'), true);
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onload = function() {
      if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          if (response.success && response.data) {
              state.besoins = response.data.besoins || [];
              state.villes = response.data.villes || [];
              state.types = response.data.types || [];
              populateSelects();
              renderTable();
          }
      }
  };
  
  xhr.send();
}

function saveBesoin(){
  var data = {
      ville_id: Number(elements.inputVille.value||0),
      type_id: Number(elements.inputType.value||0),
      description: elements.inputDescription.value.trim(),
      quantite: Number(elements.inputQuantite.value||0),
      prix_unitaire: Number(elements.inputPrix.value||0)
  };
  
  if(!data.ville_id || !data.type_id || !data.description || data.quantite<=0 || data.prix_unitaire<0){
      alert('Champs invalides');
      return;
  }
  
  var xhr = new XMLHttpRequest();
  var method = state.editing ? 'PUT' : 'POST';
  var url = state.editing ? apiUrl('/api/besoins/' + state.editing.id) : apiUrl('/api/besoins');
  
  xhr.open(method, url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
      if (xhr.status === 200) {
          closeModal();
          loadData();
      } else {
          alert('Erreur lors de l enregistrement.');
      }
  };
  
  xhr.send(JSON.stringify(data));
}

function onFilterVilleChange(e) {
    state.filterVille = e.target.value;
    renderTable();
}

function onFilterTypeChange(e) {
    state.filterType = e.target.value;
    renderTable();
}

function init(){
  if (elements.addBtn) elements.addBtn.addEventListener('click',openModal);
  if (elements.modalClose) elements.modalClose.addEventListener('click',closeModal);
  if (elements.cancelBtn) elements.cancelBtn.addEventListener('click',closeModal);
  if (elements.saveBtn) elements.saveBtn.addEventListener('click',saveBesoin);
  if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener('click', function(e) {
          if(e.target === elements.modalOverlay) closeModal();
      });
  }
  if (elements.filterVille) {
      elements.filterVille.addEventListener('change', onFilterVilleChange);
  }
  if (elements.filterType) {
      elements.filterType.addEventListener('change', onFilterTypeChange);
  }
  
  var action = new URLSearchParams(window.location.search).get('action');
  if (action === 'create') {
    openModal();
  }
  
  loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
