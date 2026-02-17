<header class="page-header">
    <div class="header-content">
        <div class="header-text">
            <h1 class="page-title">Achats via dons en argent</h1>
            <p class="page-description">Achat des besoins restants non couverts par les dons directs</p>
        </div>
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

<section class="purchase-top-grid">
    <article class="stats-card">
        <h2>Finance</h2>
        <div class="kpi-row">
            <span>Argent disponible</span>
            <strong id="moneyAvailable">0 Ar</strong>
        </div>
        <div class="kpi-row">
            <span>Argent utilisé</span>
            <strong id="moneyUsed">0 Ar</strong>
        </div>
        <div class="kpi-row">
            <span>Dons argent reçus</span>
            <strong id="moneyTotal">0 Ar</strong>
        </div>
    </article>

    <article class="stats-card">
        <h2>Configuration des frais</h2>
        <div class="config-row">
            <label for="inputFeeRate">Taux de frais (%)</label>
            <input id="inputFeeRate" type="number" min="0" max="100" step="0.01">
        </div>
        <button class="btn-primary" id="saveFeeBtn" type="button">Enregistrer</button>
        <p class="hint">Exemple: achat de 100 000 Ar avec 10% = 110 000 Ar</p>
    </article>
</section>

<section class="purchase-top-grid" id="purchaseFormSection">
    <article class="stats-card">
        <h2>Formulaire d'achat</h2>
        <div class="buy-form-grid">
            <div class="config-row">
                <label for="buyType">Type de besoin</label>
                <select id="buyType" class="filter-select">
                    <option value="">Choisir un type</option>
                </select>
            </div>
            <div class="config-row">
                <label for="buyQty">Quantité à acheter</label>
                <input id="buyQty" type="number" min="0.01" step="0.01" placeholder="Ex: 100">
            </div>
        </div>
        <button class="btn-primary" id="buySubmitBtn" type="button">Acheter</button>
        <p class="hint" id="buyFormHint">Sélectionnez un type puis saisissez la quantité à acheter.</p>
    </article>
</section>

<section class="filters-section achats-filters">
    <div class="filter-group">
        <select class="filter-select" id="filterType">
            <option value="all">Tous les types</option>
        </select>
    </div>
    <div class="filter-group">
        <button class="btn-primary" id="refreshBtn" type="button">Recharger</button>
    </div>
</section>

<section class="table-section">
    <div class="table-card">
        <div class="table-title">Synthèse des besoins par type (toutes villes)</div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Qté totale besoins</th>
                        <th>Qté restante</th>
                        <th>Dons restants</th>
                        <th>Statut</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="needsBody"></tbody>
            </table>
        </div>
    </div>
</section>

<section class="table-section history-section">
    <div class="history-header">
        <h2>Historique des achats</h2>
        <div class="filter-group">
            <select class="filter-select" id="filterPeriod">
                <option value="all">Toute période</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="month">Ce mois</option>
            </select>
        </div>
    </div>

    <div class="summary-strip">
        <div>Total HT: <strong id="historyTotalHt">0 Ar</strong></div>
        <div>Total frais: <strong id="historyTotalFrais">0 Ar</strong></div>
        <div>Total TTC: <strong id="historyTotalTtc">0 Ar</strong></div>
        <div>Achats: <strong id="historyCount">0</strong></div>
    </div>

    <div class="table-card">
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Ville</th>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>HT</th>
                        <th>Frais</th>
                        <th>TTC</th>
                    </tr>
                </thead>
                <tbody id="historyBody"></tbody>
            </table>
        </div>
    </div>
</section>
