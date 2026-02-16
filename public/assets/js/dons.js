const state = { dons: [], types: [], editing: null };
const elements = {
  addBtn: document.getElementById('addBtn'), modalOverlay: document.getElementById('modalOverlay'), modalClose: document.getElementById('modalClose'), cancelBtn: document.getElementById('cancelBtn'), saveBtn: document.getElementById('saveBtn'), modalTitle: document.getElementById('modalTitle'), tableBody: document.getElementById('tableBody'),
  inputType: document.getElementById('inputType'), inputDescription: document.getElementById('inputDescription'), inputQuantite: document.getElementById('inputQuantite'), inputValeur: document.getElementById('inputValeur'), inputDate: document.getElementById('inputDate')
};

function escapeHtml(v){return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmt(n){return Number(n||0).toLocaleString('fr-FR');}
async function api(url, options={}){ const res=await fetch(url,{headers:{'Content-Type':'application/json',Accept:'application/json'},...options}); const payload=await res.json(); if(!res.ok||payload.success===false) throw new Error(payload.message||`HTTP ${res.status}`); return payload; }

function openModal(){ elements.modalOverlay.classList.add('active'); }
function closeModal(){ elements.modalOverlay.classList.remove('active'); state.editing=null; elements.modalTitle.textContent='Ajouter un don'; elements.inputType.value=''; elements.inputQuantite.value=''; elements.inputDate.value=new Date().toISOString().slice(0,10); if(elements.inputDescription) elements.inputDescription.value=''; if(elements.inputValeur) elements.inputValeur.value=''; }

function populateTypes(){ elements.inputType.innerHTML = state.types.map((t)=>`<option value="${t.id}">${escapeHtml(t.libelle)}</option>`).join(''); }

function renderTable(){
  if(!state.dons.length){ elements.tableBody.innerHTML='<tr><td colspan="5" class="empty-row">Aucun don</td></tr>'; return; }
  elements.tableBody.innerHTML = state.dons.map((d)=>`<tr><td>${new Date(d.date_don).toLocaleDateString('fr-FR')}</td><td>${escapeHtml(d.type||'—')}</td><td>${fmt(d.quantite)}</td><td style="font-weight:600;">${fmt(d.valeur_estimee)} Ar</td><td><div class="action-buttons"><button class="action-btn edit-btn" data-id="${d.id}">Edit</button><button class="action-btn delete-btn delete" data-id="${d.id}">Del</button></div></td></tr>`).join('');
  document.querySelectorAll('.edit-btn').forEach((btn)=>btn.addEventListener('click',()=>{ const d=state.dons.find((x)=>String(x.id)===btn.dataset.id); if(!d) return; state.editing=d; elements.modalTitle.textContent='Modifier un don'; elements.inputType.value=d.type_id; elements.inputQuantite.value=d.quantite; elements.inputDate.value=String(d.date_don).slice(0,10); openModal(); }));
  document.querySelectorAll('.delete-btn').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Supprimer ce don ?')) return; try{ await api(`/api/dons/${btn.dataset.id}`,{method:'DELETE'}); await loadData(); }catch(e){ alert(e.message);} }));
}

async function loadData(){ const payload=await api('/api/dons'); state.dons=payload.data?.dons||[]; state.types=payload.data?.types||[]; populateTypes(); renderTable(); }

async function saveDon(){ const data={ type_id:Number(elements.inputType.value||0), quantite:Number(elements.inputQuantite.value||0), date_don:elements.inputDate.value }; if(!data.type_id||data.quantite<=0||!data.date_don){ alert('Champs invalides'); return; } try{ if(state.editing){ await api(`/api/dons/${state.editing.id}`,{method:'PUT',body:JSON.stringify(data)}); } else { await api('/api/dons',{method:'POST',body:JSON.stringify(data)}); } closeModal(); await loadData(); }catch(e){ alert(e.message);} }

function init(){
  elements.addBtn?.addEventListener('click',openModal);
  elements.modalClose?.addEventListener('click',closeModal);
  elements.cancelBtn?.addEventListener('click',closeModal);
  elements.saveBtn?.addEventListener('click',saveDon);
  elements.modalOverlay?.addEventListener('click',(e)=>{ if(e.target===elements.modalOverlay) closeModal();});
  closeModal();
  const action = new URLSearchParams(window.location.search).get('action');
  if (action === 'create') {
    openModal();
  }
  loadData().catch((e)=>{ elements.tableBody.innerHTML=`<tr><td colspan="5">${escapeHtml(e.message)}</td></tr>`; });
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
