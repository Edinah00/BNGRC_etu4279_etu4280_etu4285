 <header class="page-header">
            <div class="header-content" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
                <div class="header-text">
                    <h1 class="page-title">Simulation de Dispatch</h1>
                    <p class="page-description">Distribution des dons selon les besoins non satisfaits (FIFO, proportionnel ou priorité petits)</p>
                </div>
                <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
                    <button class="btn-primary" id="simulateBtn" type="button">
                        <span>Simuler le dispatch automatique</span>
                    </button>
                    <button class="btn-success" id="validateBtn" type="button" style="display:none;">Valider et enregistrer</button>
                    <button class="btn-primary" id="resetDataBtn" type="button" style="background:#b03a2e;">Réinitialiser besoins/dons</button>
                </div>
            </div>
        </header>

        <section class="mode-selector" id="modeSelector">
            <label class="mode-card" for="modeFifo">
                <input type="radio" name="mode_dispatch" id="modeFifo" value="fifo" checked>
                <div class="mode-content">
                    <span class="mode-title">FIFO</span>
                    <span class="mode-desc">Premier arrivé, premier servi</span>
                </div>
            </label>

            <label class="mode-card" for="modeProportionnel">
                <input type="radio" name="mode_dispatch" id="modeProportionnel" value="proportionnel">
                <div class="mode-content">
                    <span class="mode-title">Proportionnel</span>
                    <span class="mode-desc">Répartition selon le ratio de besoin restant</span>
                </div>
            </label>

            <label class="mode-card" id="card-priorite-petits" for="modePrioritePetits">
                <input type="radio" name="mode_dispatch" id="modePrioritePetits" value="priorite_petits">
                <div class="mode-content">
                    <span class="mode-title">Priorité Petits</span>
                    <span class="mode-desc">Les plus petits besoins sont satisfaits en premier</span>
                </div>
            </label>
        </section>

        <section class="empty-state" id="emptyState">
            <div class="empty-state-card">
                <div class="empty-state-content">
                    <h2 class="empty-state-title">Cliquez sur "Simuler" pour lancer la distribution</h2>
                    <p class="empty-state-text">Sélectionnez un mode puis lancez la simulation.</p>
                </div>
            </div>
        </section>

        <section class="no-results-state" id="noResultsState" style="display:none;">
            <div class="no-results-card">
                <div class="no-results-content">
                    <h2 class="no-results-title">Aucune distribution possible</h2>
                    <p class="no-results-text">Aucun don disponible ne correspond aux besoins restants.</p>
                </div>
            </div>
        </section>

        <section class="simulation-results" id="simulationResults" style="display:none;">
            <div class="results-card">
                <div class="results-header">
                    <h3 class="results-title" id="resultsTitle">Résultat de la simulation</h3>
                </div>
                <div class="results-table-container">
                    <table class="results-table">
                        <thead id="resultsTableHead"></thead>
                        <tbody id="resultsTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div class="results-card" style="margin-top:1rem;padding:1rem;">
                <h3 class="results-title" style="font-size:1.1rem;margin-bottom:0.75rem;">Résumé du dispatch</h3>
                <div id="summaryBlock"></div>
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1rem;flex-wrap:wrap;">
                    <button class="btn-primary" id="cancelBtn" type="button" style="background:#7f8c8d;">Annuler</button>
                </div>
            </div>
        </section>

        <div class="toast" id="toast">
            <div class="toast-content">
                <div class="toast-text">
                    <p class="toast-title" id="toastTitle">Succès</p>
                    <p class="toast-description" id="toastDescription">Opération terminée</p>
                </div>
            </div>
        </div>
