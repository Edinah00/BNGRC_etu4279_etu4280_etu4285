<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BNGRC - Rapport</title>
    <link rel="stylesheet" href="/assets/css/dashboard.css">
    <link rel="stylesheet" href="/assets/css/rapport.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <?php
        $activePage = 'rapport';
        include __DIR__ . '/model.php';
        ?>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="page-header">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="page-title">Rapport</h1>
                        <p class="page-description">Synthèse statistique complète</p>
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

            <div class="recap-header">
                <div>
                    <h2 class="recap-title">Recapitulatif financier</h2>
                    <p class="recap-subtitle">
                        Derniere mise a jour : <span id="lastUpdateTime">--:--:--</span>
                    </p>
                </div>
                <button id="refreshButton" class="btn-refresh" type="button" onclick="refreshRapport()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Actualiser
                </button>
            </div>

            <!-- Summary Cards -->
            <section class="summary-grid" id="summaryCards">
                <!-- Summary cards will be dynamically inserted here -->
            </section>

            <!-- Main Charts -->
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

            <!-- Regional Chart -->
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
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/assets/js/rapport.js"></script>
</body>
</html>
