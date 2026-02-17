<header class="page-header">
    <div class="header-content">
        <div class="header-text">
            <h1 class="page-title">Besoins</h1>
            <p class="page-description">Besoins des sinistrés par ville</p>
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

<section class="filters-section">
    <div class="filter-group">
        <select class="filter-select" id="filterVille">
            <option value="all">Toutes les villes</option>
        </select>
    </div>
    <div class="filter-group">
        <select class="filter-select" id="filterType">
            <option value="all">Tous les types</option>
            <option value="nature">En nature</option>
            <option value="materiaux">Matériaux</option>
            <option value="argent">Argent</option>
        </select>
    </div>
</section>

<section class="table-section">
    <div class="table-card">
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Ville</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Prix unit.</th>
                        <th>Total</th>
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
            <h2 class="modal-title" id="modalTitle">Ajouter un besoin</h2>
            <button class="modal-close" id="modalClose">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">Ville</label>
                <select class="form-select" id="inputVille">
                    <option value="">Sélectionner</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" id="inputType">
                    <option value="nature">En nature</option>
                    <option value="materiaux">Matériaux</option>
                    <option value="argent">Argent</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <input type="text" class="form-input" id="inputDescription" placeholder="Ex: Riz, tentes...">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Quantité</label>
                    <input type="number" class="form-input" id="inputQuantite" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Prix unitaire (Ar)</label>
                    <input type="number" class="form-input" id="inputPrix" min="0">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" id="cancelBtn">Annuler</button>
            <button class="btn-primary" id="saveBtn">Enregistrer</button>
        </div>
    </div>
</div>