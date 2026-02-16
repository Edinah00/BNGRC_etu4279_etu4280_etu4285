<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BNGRC - Tableau de bord</title>
    <link rel="stylesheet" href="/assets/css/dashboard.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <?php
        $activePage = 'dashboard';
        include __DIR__ . '/model.php';
        ?>

        <main class="main-content" id="dashboard">
            <header class="page-header">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="page-title">Tableau de bord</h1>
                        <p class="page-description">Vue d'ensemble des collectes et distributions</p>
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

            <section class="stats-grid" id="stats-container"></section>

            <section class="charts-section" id="charts">
                <div class="chart-card" id="bar-chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Besoins par région</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>

                <div class="chart-card" id="pie-chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title">Répartition des besoins</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="pieChart"></canvas>
                    </div>
                </div>
            </section>

            <section class="table-section" id="table">
                <div class="table-card">
                    <div class="table-header">
                        <h3 class="table-title">Villes et besoins</h3>
                    </div>
                    <div class="table-container">
                        <table class="data-table" id="cities-table">
                            <thead>
                                <tr>
                                    <th>Ville</th>
                                    <th>Région</th>
                                    <th>Besoins</th>
                                    <th>Valeur totale</th>
                                </tr>
                            </thead>
                            <tbody id="table-body"></tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/assets/js/dashboard.js"></script>
</body>
</html>
