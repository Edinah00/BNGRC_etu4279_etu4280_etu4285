var state = { villes: [], regions: [], editing: null };
var elements = {
  addBtn: document.getElementById('addBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  modalTitle: document.getElementById('modalTitle'),
  tableBody: document.getElementById('tableBody'),
  inputNom: document.getElementById('inputNom'),
  inputRegion: document.getElementById('inputRegion')
};

function apiUrl(path) {
    var base = window.BASE_URL || '';
    var clean = String(path || '');
    if (clean.charAt(0) !== '/') {
        clean = '/' + clean;
    }
    return base + clean;
}

function openModal(){
    elements.modalOverlay.classList.add('active');
}

function closeModal(){
    elements.modalOverlay.classList.remove('active');
    state.editing = null;
    elements.modalTitle.textContent = 'Ajouter une ville';
    elements.inputNom.value = '';
    elements.inputRegion.value = '';
}

function renderRegionsSelect(){
    elements.inputRegion.textContent = '';
    
    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Selectionner une region';
    elements.inputRegion.appendChild(defaultOpt);
    
    for (var i = 0; i < state.regions.length; i++) {
        var r = state.regions[i];
        var opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.nom;
        elements.inputRegion.appendChild(opt);
    }
}

function renderTable(){
    elements.tableBody.textContent = '';
    
    if(state.villes.length === 0){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'empty-row';
        td.textContent = 'Aucune ville';
        tr.appendChild(td);
        elements.tableBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < state.villes.length; i++) {
        var v = state.villes[i];
        var tr = document.createElement('tr');
        
        var tdNom = document.createElement('td');
        tdNom.style.fontWeight = '600';
        tdNom.textContent = v.nom;
        
        var tdRegion = document.createElement('td');
        tdRegion.textContent = v.region || '—';
        
        var tdActions = document.createElement('td');
        var divActions = document.createElement('div');
        divActions.className = 'action-buttons';
        
        var btnEdit = document.createElement('button');
        btnEdit.className = 'action-btn edit-btn';
        btnEdit.dataset.id = v.id;
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', function() {
            var villeId = this.dataset.id;
            var ville = null;
            for (var j = 0; j < state.villes.length; j++) {
                if (String(state.villes[j].id) === villeId) {
                    ville = state.villes[j];
                    break;
                }
            }
            if (!ville) return;
            state.editing = ville;
            elements.modalTitle.textContent = 'Modifier une ville';
            elements.inputNom.value = ville.nom;
            elements.inputRegion.value = ville.id_region;
            openModal();
        });
        
        var btnDelete = document.createElement('button');
        btnDelete.className = 'action-btn delete-btn delete';
        btnDelete.dataset.id = v.id;
        btnDelete.textContent = 'Del';
        btnDelete.addEventListener('click', function() {
            if (!confirm('Supprimer cette ville ?')) return;
            
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', apiUrl('/api/villes/' + this.dataset.id), true);
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
        
        tr.appendChild(tdNom);
        tr.appendChild(tdRegion);
        tr.appendChild(tdActions);
        
        elements.tableBody.appendChild(tr);
    }
}

function loadData(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl('/api/villes'), true);
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
                state.villes = response.data.villes || [];
                state.regions = response.data.regions || [];
                renderRegionsSelect();
                renderTable();
            }
        }
    };
    
    xhr.send();
}

function saveVille(){
    var nom = elements.inputNom.value.trim();
    var region_id = Number(elements.inputRegion.value || 0);
    
    if (!nom || !region_id) {
        alert('Nom et region requis');
        return;
    }
    
    var xhr = new XMLHttpRequest();
    var method = state.editing ? 'PUT' : 'POST';
    var url = state.editing ? apiUrl('/api/villes/' + state.editing.id) : apiUrl('/api/villes');
    
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
    
    xhr.send(JSON.stringify({nom: nom, region_id: region_id}));
}

function init(){
  if (elements.addBtn) elements.addBtn.addEventListener('click',openModal);
  if (elements.modalClose) elements.modalClose.addEventListener('click',closeModal);
  if (elements.cancelBtn) elements.cancelBtn.addEventListener('click',closeModal);
  if (elements.saveBtn) elements.saveBtn.addEventListener('click',saveVille);
  if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener('click', function(e) {
          if(e.target === elements.modalOverlay) closeModal();
      });
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
