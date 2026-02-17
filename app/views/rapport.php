<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BNGRC - Rapport</title>
    <link rel="stylesheet" href="/assets/css/rapport.css">
</head>
<body>
    <div class="app-container">
        <nav class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="#3E5F44"/>
                        <path d="M20 10 L20 30 M10 20 L30 20" stroke="white" stroke-width="3"/>
                    </svg>
                    <div>
                        <h1>BNGRC</h1>
                        <p>Gestion des dons</p>
                    </div>
                </div>
            </div>

            <div class="sidebar-nav">
                <h3>NAVIGATION</h3>
                <a href="/dashboard" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Dashboard
                </a>

                <a href="/regions" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="10" r="3"></circle>
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path>
                    </svg>
                    Régions
                </a>

                <a href="/villes" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    Villes
                </a>

                <a href="/besoins" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Besoins
                </a>

                <a href="/dons" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Dons
                </a>

                <a href="/dispatch" class="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                    Dispatch
                </a>

                <a href="/rapport" class="nav-link active">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3v18h18"></path>
                        <path d="M18 17V9"></path>
                        <path d="M13 17V5"></path>
                        <path d="M8 17v-3"></path>
                    </svg>
                    Rapport
                </a>
            </div>
        </nav>

        <main class="main-content">
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
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/assets/js/rapport.js"></script>
</body>
</html>