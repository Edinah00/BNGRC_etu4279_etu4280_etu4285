<?php

declare(strict_types=1);

$activePage = $activePage ?? '';

$menuItems = [
    ['key' => 'dashboard', 'label' => 'Dashboard', 'href' => '/dashboard'],
    ['key' => 'regions', 'label' => 'Regions', 'href' => '/regions'],
    ['key' => 'villes', 'label' => 'Villes', 'href' => '/villes'],
    ['key' => 'besoins', 'label' => 'Besoins', 'href' => '/besoins'],
    ['key' => 'dons', 'label' => 'Dons', 'href' => '/dons'],
    ['key' => 'rapport', 'label' => 'Rapport', 'href' => '/rapport'],
];
?>
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
            <?php foreach ($menuItems as $item): ?>
                <li class="nav-item<?= $activePage === $item['key'] ? ' active' : '' ?>">
                    <a href="<?= htmlspecialchars($item['href'], ENT_QUOTES, 'UTF-8') ?>" class="nav-link">
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
