const state = { besoins: [], villes: [], types: [], editing: null, filterVille: 'all', filterType: 'all' };
const elements = {
  addBtn: document.getElementById('addBtn'), modalOverlay: document.getElementById('modalOverlay'), modalClose: document.getElementById('modalClose'), cancelBtn: document.getElementById('cancelBtn'), saveBtn: document.getElementById('saveBtn'), modalTitle: document.getElementById('modalTitle'), tableBody: document.getElementById('tableBody'),
  filterVille: document.getElementById('filterVille'), filterType: document.getElementById('filterType'), inputVille: document.getElementById('inputVille'), inputType: document.getElementById('inputType'), inputDescription: document.getElementById('inputDescription'), inputQuantite: document.getElementById('inputQuantite'), inputPrix: document.getElementById('inputPrix')
};

function escapeHtml(v){return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmt(n){return Number(n||0).toLocaleString('fr-FR');}
async function api(url, options={}){ const res=await fetch(url,{headers:{'Content-Type':'application/json',Accept:'application/json'},...options}); const payload=await res.json(); if(!res.ok||payload.success===false) throw new Error(payload.message||`HTTP ${res.status}`); return payload; }
function openModal(){ elements.modalOverlay.classList.add('active'); }
function closeModal(){ elements.modalOverlay.classList.remove('active'); state.editing=null; elements.modalTitle.textContent='Ajouter un besoin'; elements.inputVille.value=''; elements.inputType.value=''; elements.inputDescription.value=''; elements.inputQuantite.value=''; elements.inputPrix.value=''; }

function populateSelects(){
  const villeOpts = state.villes.map((v)=>`<option value="${v.id}">${escapeHtml(v.nom)}</option>`).join('');
  const typeOpts = state.types.map((t)=>`<option value="${t.id}">${escapeHtml(t.libelle)}</option>`).join('');
  elements.inputVille.innerHTML = `<option value="">Selectionner</option>${villeOpts}`;
  elements.filterVille.innerHTML = `<option value="all">Toutes les villes</option>${villeOpts}`;
  elements.inputType.innerHTML = typeOpts;
  elements.filterType.innerHTML = `<option value="all">Tous les types</option>${typeOpts}`;
}

function filtered(){
  return state.besoins.filter((b)=> (state.filterVille==='all'||String(b.ville_id)===state.filterVille) && (state.filterType==='all'||String(b.type_id)===state.filterType));
}

function renderTable(){
  const rows = filtered();
  if(!rows.length){ elements.tableBody.innerHTML='<tr><td colspan="7" class="empty-row">Aucun besoin</td></tr>'; return; }
  elements.tableBody.innerHTML = rows.map((b)=>`<tr><td>${escapeHtml(b.ville||'—')}</td><td>${escapeHtml(b.type||'—')}</td><td>${escapeHtml(b.description||'')}</td><td>${fmt(b.quantite)}</td><td>${fmt(b.prix_unitaire)} Ar</td><td style="font-weight:600;">${fmt(Number(b.quantite)*Number(b.prix_unitaire))} Ar</td><td><div class="action-buttons"><button class="action-btn edit-btn" data-id="${b.id}">Edit</button><button class="action-btn delete-btn delete" data-id="${b.id}">Del</button></div></td></tr>`).join('');
  document.querySelectorAll('.edit-btn').forEach((btn)=>btn.addEventListener('click',()=>{ const b=state.besoins.find((x)=>String(x.id)===btn.dataset.id); if(!b) return; state.editing=b; elements.modalTitle.textContent='Modifier un besoin'; elements.inputVille.value=b.ville_id; elements.inputType.value=b.type_id; elements.inputDescription.value=b.description; elements.inputQuantite.value=b.quantite; elements.inputPrix.value=b.prix_unitaire; openModal(); }));
  document.querySelectorAll('.delete-btn').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Supprimer ce besoin ?')) return; try{ await api(`/api/besoins/${btn.dataset.id}`,{method:'DELETE'}); await loadData(); }catch(e){alert(e.message);} }));
}

async function loadData(){
  const payload = await api('/api/besoins');
  state.besoins = payload.data?.besoins || [];
  state.villes = payload.data?.villes || [];
  state.types = payload.data?.types || [];
  populateSelects();
  renderTable();
}

async function saveBesoin(){
  const data={ ville_id:Number(elements.inputVille.value||0), type_id:Number(elements.inputType.value||0), description:elements.inputDescription.value.trim(), quantite:Number(elements.inputQuantite.value||0), prix_unitaire:Number(elements.inputPrix.value||0) };
  if(!data.ville_id||!data.type_id||!data.description||data.quantite<=0||data.prix_unitaire<0){ alert('Champs invalides'); return; }
  try{
    if(state.editing){ await api(`/api/besoins/${state.editing.id}`,{method:'PUT',body:JSON.stringify(data)}); }
    else { await api('/api/besoins',{method:'POST',body:JSON.stringify(data)}); }
    closeModal(); await loadData();
  }catch(e){ alert(e.message); }
}

function init(){
  elements.addBtn?.addEventListener('click',openModal); elements.modalClose?.addEventListener('click',closeModal); elements.cancelBtn?.addEventListener('click',closeModal); elements.saveBtn?.addEventListener('click',saveBesoin);
  elements.modalOverlay?.addEventListener('click',(e)=>{ if(e.target===elements.modalOverlay) closeModal(); });
  elements.filterVille?.addEventListener('change',(e)=>{ state.filterVille=e.target.value; renderTable(); });
  elements.filterType?.addEventListener('change',(e)=>{ state.filterType=e.target.value; renderTable(); });
  const action = new URLSearchParams(window.location.search).get('action');
  if (action === 'create') {
    openModal();
  }
  loadData().catch((e)=>{ elements.tableBody.innerHTML=`<tr><td colspan="7">${escapeHtml(e.message)}</td></tr>`; });
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
