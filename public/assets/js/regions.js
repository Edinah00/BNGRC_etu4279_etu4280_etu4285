const state = { regions: [], editing: null };

const elements = {
  addBtn: document.getElementById('addBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalClose: document.getElementById('modalClose'),
  cancelBtn: document.getElementById('cancelBtn'),
  saveBtn: document.getElementById('saveBtn'),
  modalTitle: document.getElementById('modalTitle'),
  tableBody: document.getElementById('tableBody'),
  inputNom: document.getElementById('inputNom')
};

function escapeHtml(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, ...options });
  const payload = await res.json();
  if (!res.ok || payload.success === false) throw new Error(payload.message || `HTTP ${res.status}`);
  return payload;
}

function openModal() { elements.modalOverlay.classList.add('active'); }
function closeModal() { elements.modalOverlay.classList.remove('active'); state.editing = null; elements.modalTitle.textContent = 'Ajouter une region'; elements.inputNom.value = ''; }

function renderTable() {
  if (!state.regions.length) {
    elements.tableBody.innerHTML = '<tr><td colspan="3" class="empty-row">Aucune region</td></tr>';
    return;
  }

  elements.tableBody.innerHTML = state.regions.map((r) => `
    <tr>
      <td style="font-weight:600;">${escapeHtml(r.nom)}</td>
      <td>${Number(r.nb_villes || 0)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" data-id="${r.id}" title="Modifier">Edit</button>
          <button class="action-btn delete-btn delete" data-id="${r.id}" title="Supprimer">Del</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const region = state.regions.find((r) => String(r.id) === btn.dataset.id);
      if (!region) return;
      state.editing = region;
      elements.modalTitle.textContent = 'Modifier une region';
      elements.inputNom.value = region.nom;
      openModal();
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Supprimer cette region ?')) return;
      try {
        await api(`/api/regions/${btn.dataset.id}`, { method: 'DELETE' });
        await loadData();
      } catch (e) { alert(e.message); }
    });
  });
}

async function loadData() {
  const payload = await api('/api/regions');
  state.regions = payload.data || [];
  renderTable();
}

async function saveRegion() {
  const nom = elements.inputNom.value.trim();
  if (!nom) { alert('Nom requis'); return; }
  try {
    if (state.editing) {
      await api(`/api/regions/${state.editing.id}`, { method: 'PUT', body: JSON.stringify({ nom }) });
    } else {
      await api('/api/regions', { method: 'POST', body: JSON.stringify({ nom }) });
    }
    closeModal();
    await loadData();
  } catch (e) { alert(e.message); }
}

function init() {
  elements.addBtn?.addEventListener('click', openModal);
  elements.modalClose?.addEventListener('click', closeModal);
  elements.cancelBtn?.addEventListener('click', closeModal);
  elements.saveBtn?.addEventListener('click', saveRegion);
  elements.modalOverlay?.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) closeModal(); });
  const action = new URLSearchParams(window.location.search).get('action');
  if (action === 'create') {
    openModal();
  }
  loadData().catch((e) => { elements.tableBody.innerHTML = `<tr><td colspan="3">${escapeHtml(e.message)}</td></tr>`; });
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
