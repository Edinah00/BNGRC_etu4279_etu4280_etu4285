<header class="page-header">
    <div class="header-content">
        <div class="header-text">
            <h1 class="page-title">Rapport</h1>
            <p class="page-description">Synthèse statistique complète</p>
        </div>
    </div>
</header>

<div class="recap-header">
    <div>
        <h2 class="recap-title">Récapitulatif financier</h2>
        <p class="recap-subtitle">
            Dernière mise à jour : <span id="lastUpdateTime">--:--:--</span>
        </p>
    </div>
    <button id="refreshButton" class="btn-refresh" onclick="refreshRapport()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        Actualiser
    </button>
</div>

<section class="summary-grid" id="summaryCards"></section>

<section class="main-charts">
    <div class="chart-card">
        <div class="chart-header">
            <h3 class="chart-title">Besoins vs Dons par type</h3>
        </div>
        <div class="chart-body">
            <canvas id="typeComparisonChart"></canvas>
        </div>
    </div>

    <div class="chart-card">
        <div class="chart-header">
            <h3 class="chart-title">Répartition globale</h3>
        </div>
        <div class="chart-body">
            <canvas id="globalDistributionChart"></canvas>
        </div>
    </div>
</section>

<section class="regional-chart">
    <div class="chart-card">
        <div class="chart-header">
            <h3 class="chart-title">Besoins par région</h3>
        </div>
        <div class="chart-body chart-body-large">
            <canvas id="regionalChart"></canvas>
        </div>
    </div>
</section>