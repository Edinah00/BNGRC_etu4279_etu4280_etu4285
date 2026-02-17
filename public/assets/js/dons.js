var state = { dons: [], types: [], editing: null };
var elements = {
  addBtn: document.getElementById('addBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  modalTitle: document.getElementById('modalTitle'),
  tableBody: document.getElementById('tableBody'),
  inputType: document.getElementById('inputType'),
  inputQuantite: document.getElementById('inputQuantite'),
  inputDate: document.getElementById('inputDate')
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
    elements.modalTitle.textContent = 'Ajouter un don';
    elements.inputType.value = '';
    elements.inputQuantite.value = '';
    elements.inputDate.value = new Date().toISOString().slice(0,10);
}

function populateTypes(){
    elements.inputType.textContent = '';
    
    for (var i = 0; i < state.types.length; i++) {
        var t = state.types[i];
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.categorie || t.libelle;
        elements.inputType.appendChild(opt);
    }
}

function renderTable(){
    elements.tableBody.textContent = '';
    
    if(state.dons.length === 0){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'empty-row';
        td.textContent = 'Aucun don';
        tr.appendChild(td);
        elements.tableBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < state.dons.length; i++) {
        var d = state.dons[i];
        var tr = document.createElement('tr');
        
        var tdDate = document.createElement('td');
        tdDate.textContent = new Date(d.date_don).toLocaleDateString('fr-FR');
        
        var tdType = document.createElement('td');
        tdType.textContent = d.type || '—';
        
        var tdQte = document.createElement('td');
        tdQte.textContent = fmt(d.quantite);

        var tdUsed = document.createElement('td');
        tdUsed.textContent = fmt(d.quantite_utilisee);

        var tdRemain = document.createElement('td');
        tdRemain.textContent = fmt(d.quantite_restante);
        
        var tdValeur = document.createElement('td');
        tdValeur.style.fontWeight = '600';
        tdValeur.textContent = fmt(d.valeur_estimee) + ' Ar';
        
        var tdActions = document.createElement('td');
        var divActions = document.createElement('div');
        divActions.className = 'action-buttons';
        
        var btnEdit = document.createElement('button');
        btnEdit.className = 'action-btn edit-btn';
        btnEdit.dataset.id = d.id;
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', function() {
            var donId = this.dataset.id;
            var don = null;
            for (var j = 0; j < state.dons.length; j++) {
                if (String(state.dons[j].id) === donId) {
                    don = state.dons[j];
                    break;
                }
            }
            if (!don) return;
            state.editing = don;
            elements.modalTitle.textContent = 'Modifier un don';
            elements.inputType.value = don.id_type;
            elements.inputQuantite.value = don.quantite;
            elements.inputDate.value = String(don.date_don).slice(0,10);
            openModal();
        });
        
        var btnDelete = document.createElement('button');
        btnDelete.className = 'action-btn delete-btn delete';
        btnDelete.dataset.id = d.id;
        btnDelete.textContent = 'Del';
        btnDelete.addEventListener('click', function() {
            if (!confirm('Supprimer ce don ?')) return;
            
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', apiUrl('/api/dons/' + this.dataset.id), true);
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
        
        tr.appendChild(tdDate);
        tr.appendChild(tdType);
        tr.appendChild(tdQte);
        tr.appendChild(tdUsed);
        tr.appendChild(tdRemain);
        tr.appendChild(tdValeur);
        tr.appendChild(tdActions);
        
        elements.tableBody.appendChild(tr);
    }
}

function loadData(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl('/api/dons'), true);
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
                state.dons = response.data.dons || [];
                state.types = response.data.types || [];
                populateTypes();
                renderTable();
            }
        }
    };
    
    xhr.send();
}

function saveDon(){
    var data = {
        type_id: Number(elements.inputType.value||0),
        quantite: Number(elements.inputQuantite.value||0),
        date_don: elements.inputDate.value
    };
    
    if(!data.type_id || data.quantite<=0 || !data.date_don){
        alert('Champs invalides');
        return;
    }
    
    var xhr = new XMLHttpRequest();
    var method = state.editing ? 'PUT' : 'POST';
    var url = state.editing ? apiUrl('/api/dons/' + state.editing.id) : apiUrl('/api/dons');
    
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

function init(){
  if (elements.addBtn) elements.addBtn.addEventListener('click',openModal);
  if (elements.modalClose) elements.modalClose.addEventListener('click',closeModal);
  if (elements.cancelBtn) elements.cancelBtn.addEventListener('click',closeModal);
  if (elements.saveBtn) elements.saveBtn.addEventListener('click',saveDon);
  if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener('click', function(e) {
          if(e.target === elements.modalOverlay) closeModal();
      });
  }
  closeModal();
  
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
