var state = { regions: [], editing: null };
var elements = {
  addBtn: document.getElementById('addBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  modalTitle: document.getElementById('modalTitle'),
  tableBody: document.getElementById('tableBody'),
  inputNom: document.getElementById('inputNom')
};

function apiUrl(path) {
    var base = window.BASE_URL || '';
    var clean = String(path || '');
    if (clean.charAt(0) !== '/') {
        clean = '/' + clean;
    }
    return base + clean;
}

function openModal() {
    elements.modalOverlay.classList.add('active');
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    state.editing = null;
    elements.modalTitle.textContent = 'Ajouter une region';
    elements.inputNom.value = '';
}

function renderTable() {
    elements.tableBody.textContent = '';
    
    if (state.regions.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'empty-row';
        td.textContent = 'Aucune region';
        tr.appendChild(td);
        elements.tableBody.appendChild(tr);
        return;
    }
    
    for (var i = 0; i < state.regions.length; i++) {
        var r = state.regions[i];
        var tr = document.createElement('tr');
        
        var tdNom = document.createElement('td');
        tdNom.style.fontWeight = '600';
        tdNom.textContent = r.nom;
        
        var tdNbVilles = document.createElement('td');
        tdNbVilles.textContent = Number(r.nb_villes || 0);
        
        var tdActions = document.createElement('td');
        var divActions = document.createElement('div');
        divActions.className = 'action-buttons';
        
        var btnEdit = document.createElement('button');
        btnEdit.className = 'action-btn edit-btn';
        btnEdit.dataset.id = r.id;
        btnEdit.title = 'Modifier';
        btnEdit.textContent = 'Edit';
        btnEdit.addEventListener('click', function() {
            var regionId = this.dataset.id;
            var region = null;
            for (var j = 0; j < state.regions.length; j++) {
                if (String(state.regions[j].id) === regionId) {
                    region = state.regions[j];
                    break;
                }
            }
            if (!region) return;
            state.editing = region;
            elements.modalTitle.textContent = 'Modifier une region';
            elements.inputNom.value = region.nom;
            openModal();
        });
        
        var btnDelete = document.createElement('button');
        btnDelete.className = 'action-btn delete-btn delete';
        btnDelete.dataset.id = r.id;
        btnDelete.title = 'Supprimer';
        btnDelete.textContent = 'Del';
        btnDelete.addEventListener('click', function() {
            if (!confirm('Supprimer cette region ?')) return;
            
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', apiUrl('/api/regions/' + this.dataset.id), true);
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
        tr.appendChild(tdNbVilles);
        tr.appendChild(tdActions);
        
        elements.tableBody.appendChild(tr);
    }
}

function loadData() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiUrl('/api/regions'), true);
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onload = function() {
      if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          if (response.success && response.data) {
              state.regions = response.data || [];
              renderTable();
          }
      }
  };
  
  xhr.send();
}

function saveRegion() {
  var nom = elements.inputNom.value.trim();
  if (!nom) {
      alert('Nom requis');
      return;
  }
  
  var xhr = new XMLHttpRequest();
  var method = state.editing ? 'PUT' : 'POST';
  var url = state.editing ? apiUrl('/api/regions/' + state.editing.id) : apiUrl('/api/regions');
  
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
  
  xhr.send(JSON.stringify({ nom: nom }));
}

function init() {
  if (elements.addBtn) elements.addBtn.addEventListener('click', openModal);
  if (elements.modalClose) elements.modalClose.addEventListener('click', closeModal);
  if (elements.cancelBtn) elements.cancelBtn.addEventListener('click', closeModal);
  if (elements.saveBtn) elements.saveBtn.addEventListener('click', saveRegion);
  if (elements.modalOverlay) {
      elements.modalOverlay.addEventListener('click', function(e) {
          if (e.target === elements.modalOverlay) closeModal();
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
