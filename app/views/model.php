<?php

declare(strict_types=1);

$activePage = $activePage ?? '';

$menuItems = [
    [
        'key' => 'dashboard',
        'label' => 'Dashboard',
        'href' => '/dashboard',
        'icon' => '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    ],
    [
        'key' => 'regions',
        'label' => 'Regions',
        'href' => '/regions',
        'icon' => '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    ],
    [
        'key' => 'villes',
        'label' => 'Villes',
        'href' => '/villes',
        'icon' => '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path>',
    ],
    [
        'key' => 'besoins',
        'label' => 'Besoins',
        'href' => '/besoins',
        'icon' => '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect>',
    ],
    [
        'key' => 'dons',
        'label' => 'Dons',
        'href' => '/dons',
        'icon' => '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    ],
    [
        'key' => 'dispatch',
        'label' => 'Dispatch',
        'href' => '/dispatch',
        'icon' => '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
    ],
    [
        'key' => 'achats',
        'label' => 'Achats',
        'href' => '/achats',
        'icon' => '<circle cx="9" cy="20" r="1"></circle><circle cx="20" cy="20" r="1"></circle><path d="M1 1h4l2.7 12.8a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.7l1.2-6.7H6"></path>',
    ],
    [
        'key' => 'rapport',
        'label' => 'Rapport',
        'href' => '/rapport',
        'icon' => '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
    ],
];
?>
<aside class="sidebar">
    <div class="sidebar-header">
        <div class="logo-container">
            <div class="logo-badge">
                <img src="/assets/images/bngrc.png" alt="Logo BNGRC">
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
                <li class="nav-item<?= $activePage === $item['key'] ? ' active' : '' ?>">
                    <a href="<?= htmlspecialchars($item['href'], ENT_QUOTES, 'UTF-8') ?>" class="nav-link">
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
