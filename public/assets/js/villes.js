const state = { villes: [], regions: [], editing: null };
const elements = {
  addBtn: document.getElementById('addBtn'), modalOverlay: document.getElementById('modalOverlay'), modalClose: document.getElementById('modalClose'), cancelBtn: document.getElementById('cancelBtn'), saveBtn: document.getElementById('saveBtn'), modalTitle: document.getElementById('modalTitle'), tableBody: document.getElementById('tableBody'), inputNom: document.getElementById('inputNom'), inputRegion: document.getElementById('inputRegion')
};

function escapeHtml(v){ return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
async function api(url, options={}){ const res=await fetch(url,{headers:{'Content-Type':'application/json',Accept:'application/json'},...options}); const payload=await res.json(); if(!res.ok||payload.success===false) throw new Error(payload.message||`HTTP ${res.status}`); return payload; }
function openModal(){ elements.modalOverlay.classList.add('active'); }
function closeModal(){ elements.modalOverlay.classList.remove('active'); state.editing=null; elements.modalTitle.textContent='Ajouter une ville'; elements.inputNom.value=''; elements.inputRegion.value=''; }

function renderRegionsSelect(){
  elements.inputRegion.innerHTML = '<option value="">Selectionner une region</option>' + state.regions.map((r)=>`<option value="${r.id}">${escapeHtml(r.nom)}</option>`).join('');
}

function renderTable(){
  if(!state.villes.length){ elements.tableBody.innerHTML='<tr><td colspan="3" class="empty-row">Aucune ville</td></tr>'; return; }
  elements.tableBody.innerHTML = state.villes.map((v)=>`<tr><td style="font-weight:600;">${escapeHtml(v.nom)}</td><td>${escapeHtml(v.region||'—')}</td><td><div class="action-buttons"><button class="action-btn edit-btn" data-id="${v.id}">Edit</button><button class="action-btn delete-btn delete" data-id="${v.id}">Del</button></div></td></tr>`).join('');
  document.querySelectorAll('.edit-btn').forEach((btn)=>btn.addEventListener('click',()=>{ const ville=state.villes.find((v)=>String(v.id)===btn.dataset.id); if(!ville) return; state.editing=ville; elements.modalTitle.textContent='Modifier une ville'; elements.inputNom.value=ville.nom; elements.inputRegion.value=ville.region_id; openModal(); }));
  document.querySelectorAll('.delete-btn').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Supprimer cette ville ?')) return; try{ await api(`/api/villes/${btn.dataset.id}`,{method:'DELETE'}); await loadData(); }catch(e){ alert(e.message); }}));
}

async function loadData(){ const payload=await api('/api/villes'); state.villes=payload.data?.villes||[]; state.regions=payload.data?.regions||[]; renderRegionsSelect(); renderTable(); }
async function saveVille(){ const nom=elements.inputNom.value.trim(); const region_id=Number(elements.inputRegion.value||0); if(!nom||!region_id){ alert('Nom et region requis'); return; } try{ if(state.editing){ await api(`/api/villes/${state.editing.id}`,{method:'PUT',body:JSON.stringify({nom,region_id})}); } else { await api('/api/villes',{method:'POST',body:JSON.stringify({nom,region_id})}); } closeModal(); await loadData(); }catch(e){ alert(e.message); } }

function init(){
  elements.addBtn?.addEventListener('click',openModal);
  elements.modalClose?.addEventListener('click',closeModal);
  elements.cancelBtn?.addEventListener('click',closeModal);
  elements.saveBtn?.addEventListener('click',saveVille);
  elements.modalOverlay?.addEventListener('click',(e)=>{ if(e.target===elements.modalOverlay) closeModal();});
  const action = new URLSearchParams(window.location.search).get('action');
  if (action === 'create') {
    openModal();
  }
  loadData().catch((e)=>{ elements.tableBody.innerHTML=`<tr><td colspan="3">${escapeHtml(e.message)}</td></tr>`; });
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
