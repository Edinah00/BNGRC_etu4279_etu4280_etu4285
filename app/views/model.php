<?php
$page = $page ?? 'dashboard';
$pageTitle = match($page) {
    'dashboard'  => 'BNGRC - Tableau de bord',
    'regions'    => 'BNGRC - Régions',
    'villes'     => 'BNGRC - Villes',
    'besoins'    => 'BNGRC - Besoins',
    'dons'       => 'BNGRC - Dons',
    'dispatch'   => 'BNGRC - Dispatch',
    'achats'     => 'BNGRC - Achats',
    'rapport'    => 'BNGRC - Rapport',
    default      => 'BNGRC',
};

$pageCssMap = [
    'dashboard' => ['/assets/css/dashboard.css'],
    'regions'   => ['/assets/css/besoins.css'],
    'villes'    => ['/assets/css/besoins.css'],
    'besoins'   => ['/assets/css/besoins.css'],
    'dons'      => ['/assets/css/besoins.css'],
    'dispatch'  => ['/assets/css/dispatch.css'],
    'achats'    => ['/assets/css/besoins.css', '/assets/css/achats.css'],
    'rapport'   => ['/assets/css/rapport.css'],
];

$pageJsMap = [
    'dashboard' => ['https://cdn.jsdelivr.net/npm/chart.js', '/assets/js/dashboard.js'],
    'regions'   => ['/assets/js/regions.js'],
    'villes'    => ['/assets/js/villes.js'],
    'besoins'   => ['/assets/js/besoins.js'],
    'dons'      => ['/assets/js/dons.js'],
    'dispatch'  => ['/assets/js/dispatch.js'],
    'achats'    => ['/assets/js/achats.js'],
    'rapport'   => ['https://cdn.jsdelivr.net/npm/chart.js', '/assets/js/rapport.js'],
];

$pageCss = $pageCssMap[$page] ?? [];
$pageJs  = $pageJsMap[$page]  ?? [];

$menuItems = [
    [
        'key'   => 'dashboard',
        'label' => 'Dashboard',
        'href'  => '/dashboard',
        'icon'  => '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    ],
    [
        'key'   => 'regions',
        'label' => 'Regions',
        'href'  => '/regions',
        'icon'  => '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    ],
    [
        'key'   => 'villes',
        'label' => 'Villes',
        'href'  => '/villes',
        'icon'  => '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path>',
    ],
    [
        'key'   => 'besoins',
        'label' => 'Besoins',
        'href'  => '/besoins',
        'icon'  => '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect>',
    ],
    [
        'key'   => 'dons',
        'label' => 'Dons',
        'href'  => '/dons',
        'icon'  => '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    ],
    [
        'key'   => 'dispatch',
        'label' => 'Dispatch',
        'href'  => '/dispatch',
        'icon'  => '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
    ],
    [
        'key'   => 'achats',
        'label' => 'Achats',
        'href'  => '/achats',
        'icon'  => '<circle cx="9" cy="20" r="1"></circle><circle cx="20" cy="20" r="1"></circle><path d="M1 1h4l2.7 12.8a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.7l1.2-6.7H6"></path>',
    ],
    [
        'key'   => 'rapport',
        'label' => 'Recapitulation',
        'href'  => '/rapport',
        'icon'  => '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
    ],
];

$mainIdMap = ['dashboard' => 'dashboard'];
$mainStyleMap = ['dispatch' => 'max-width:1200px;padding:2rem 1rem;'];
$mainClassMap = [];

$mainId    = $mainIdMap[$page]    ?? '';
$mainStyle = $mainStyleMap[$page] ?? '';
$mainClass = $mainClassMap[$page] ?? 'main-content';
$baseUrl = defined('BASE_URL') ? rtrim(BASE_URL, '/') : '';
$withBase = static function (string $path) use ($baseUrl): string {
    if (preg_match('#^https?://#i', $path)) {
        return $path;
    }
    return $baseUrl . (str_starts_with($path, '/') ? $path : '/' . $path);
};
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="<?= htmlspecialchars($withBase('/assets/css/dashboard.css'), ENT_QUOTES, 'UTF-8') ?>">
    <?php foreach ($pageCss as $css): ?>
        <link rel="stylesheet" href="<?= htmlspecialchars($withBase($css), ENT_QUOTES, 'UTF-8') ?>">
    <?php endforeach; ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-container">
                    <div class="logo-badge">
                        <img src="<?= htmlspecialchars($withBase('/assets/images/bngrc.png'), ENT_QUOTES, 'UTF-8') ?>" alt="Logo BNGRC">
                    </div>
                    <div class="logo-text">
                        <h1>BNGRC</h1>
                        <p>Gestion des dons</p>
                    </div>
                </div>
            </div>

            <nav class="sidebar-nav">
                <p class="nav-label">NAVIGATION</p>
                <ul class="nav-list">
                    <?php foreach ($menuItems as $item): ?>
                        <li class="nav-item<?= $page === $item['key'] ? ' active' : '' ?>">
                            <a href="<?= htmlspecialchars($withBase($item['href']), ENT_QUOTES, 'UTF-8') ?>" class="nav-link">
                                <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <?= $item['icon'] ?>
                                </svg>
                                <span><?= htmlspecialchars($item['label'], ENT_QUOTES, 'UTF-8') ?></span>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </nav>

            <div class="sidebar-footer">
                <button class="disconnect-btn" type="button">
                    <span>Deconnexion</span>
                </button>
            </div>
        </aside>

        <main class="<?= htmlspecialchars($mainClass, ENT_QUOTES, 'UTF-8') ?>"<?= $mainId !== '' ? ' id="' . htmlspecialchars($mainId, ENT_QUOTES, 'UTF-8') . '"' : '' ?><?= $mainStyle !== '' ? ' style="' . htmlspecialchars($mainStyle, ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
            <?php
                $viewsPath = Flight::get('flight.views.path') ?? __DIR__;
                $viewFile  = rtrim($viewsPath, '/\\') . DIRECTORY_SEPARATOR . $page . '.php';
                if (file_exists($viewFile)) {
                    include $viewFile;
                } else {
                    echo '<p>Vue introuvable : ' . htmlspecialchars($page, ENT_QUOTES, 'UTF-8') . '</p>';
                }
            ?>
        </main>
    </div>



    <script>
        window.BASE_URL = <?= json_encode($baseUrl, JSON_UNESCAPED_SLASHES) ?>;
    </script>
    <?php foreach ($pageJs as $js): ?>
        <script src="<?= htmlspecialchars($withBase($js), ENT_QUOTES, 'UTF-8') ?>"></script>
    <?php endforeach; ?>
</body>
</html>
