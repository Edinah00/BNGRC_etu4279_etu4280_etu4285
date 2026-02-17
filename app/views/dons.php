<header class="page-header">
    <div class="header-content">
        <div class="header-text">
            <h1 class="page-title">Dons</h1>
            <p class="page-description">Saisie et suivi des dons reçus</p>
        </div>
        <button class="btn-primary" id="addBtn">
            <svg class="btn-icon-left" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Ajouter</span>
        </button>
        <button class="menu-toggle" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
        </button>
    </div>
</header>

<section class="table-section">
    <div class="table-card">
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantité</th>
                        <th>Déjà utilisé</th>
                        <th>Restant</th>
                        <th>Valeur estimee</th>
                        <th class="actions-column">Actions</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
    </div>
</section>

<div class="modal-overlay" id="modalOverlay">
    <div class="modal-dialog">
        <div class="modal-header">
            <h2 class="modal-title" id="modalTitle">Ajouter un don</h2>
            <button class="modal-close" id="modalClose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" id="inputType">
                    <option value="nature">En nature</option>
                    <option value="materiaux">Matériaux</option>
                    <option value="argent">Argent</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Quantité</label>
                    <input type="number" class="form-input" id="inputQuantite" min="0">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Date de saisie</label>
                <input type="date" class="form-input" id="inputDate">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" id="cancelBtn">Annuler</button>
            <button class="btn-primary" id="saveBtn">Enregistrer</button>
        </div>
    </div>
</div>
