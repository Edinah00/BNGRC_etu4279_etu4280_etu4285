<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BNGRC - Tableau de bord</title>
    <link rel="stylesheet" href="dashboard.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <div class="logo-badge">B</div>
                    <div class="logo-text">
                        <h1>BNGRC</h1>
                        <p>Gestion des dons</p>
                    </div>
                </div>
            </div>

            <nav class="sidebar-nav">
                <p class="nav-label">NAVIGATION</p>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="#accueil" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <span>Accueil</span>
                        </a>
                    </li>
                    <li class="nav-item active">
                        <a href="#dashboard" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#regions" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>Régions</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#villes" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <path d="M9 22V12h6v10"></path>
                            </svg>
                            <span>Villes</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#besoins" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                                <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                            </svg>
                            <span>Besoins</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#dons" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                                <rect x="2" y="7" width="20" height="5"></rect>
                                <path d="M12 22V7"></path>
                                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                            </svg>
                            <span>Dons</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#dispatch" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                            <span>Dispatch</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#historique" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Historique</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#rapport" class="nav-link">
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                            <span>Rapport</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <button class="disconnect-btn">
                    <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
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

            <!-- Stats Grid -->
            <section class="stats-grid" id="stats-container">
                <!-- Stats will be dynamically inserted here -->
            </section>

            <!-- Charts Section -->
            <section class="charts-section">
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

            <!-- Data Table -->
            <section class="table-section">
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
                            <tbody id="table-body">
                                <!-- Table rows will be dynamically inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="dashboard.js"></script>
</body>
</html>
