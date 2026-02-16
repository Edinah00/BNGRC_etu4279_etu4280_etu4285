// ============================================
// BNGRC Dashboard - Dynamic data via API
// ============================================

const icons = {
    map: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    building: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>`,
    clipboard: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect></svg>`,
    gift: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
    truck: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    dollar: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
};

let barChartInstance = null;
let pieChartInstance = null;

function formatNumber(value) {
    return Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderStatsCards(stats) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const statsConfig = [
        { label: 'Régions', value: stats.regions, icon: 'map', colorClass: 'primary' },
        { label: 'Villes', value: stats.villes, icon: 'building', colorClass: 'secondary' },
        { label: 'Besoins enregistrés', value: stats.besoins, icon: 'clipboard', colorClass: 'accent' },
        { label: 'Dons reçus', value: stats.dons, icon: 'gift', colorClass: 'primary' },
        { label: 'Distributions', value: stats.distributions, icon: 'truck', colorClass: 'secondary' },
        { label: 'Valeur dons estimée (Ar)', value: formatNumber(stats.valeur_dons_estimee), icon: 'dollar', colorClass: 'accent' }
    ];

    statsContainer.innerHTML = statsConfig.map((stat) => `
        <div class="stat-card" id="stats">
            <div class="stat-icon ${stat.colorClass}">${icons[stat.icon]}</div>
            <div class="stat-content">
                <div class="stat-value">${escapeHtml(stat.value)}</div>
                <div class="stat-label">${escapeHtml(stat.label)}</div>
            </div>
        </div>
    `).join('');
}

function renderTable(rows) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">Aucune donnée disponible.</td></tr>';
        return;
    }

    tableBody.innerHTML = rows.map((row) => `
        <tr>
            <td>${escapeHtml(row.ville)}</td>
            <td>${escapeHtml(row.region || '—')}</td>
            <td>${escapeHtml(row.besoins)}</td>
            <td>${formatNumber(row.value)} Ar</td>
        </tr>
    `).join('');
}

function renderBarChart(barData) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    const cleanData = (Array.isArray(barData) ? barData : []).map((item) => ({
        region: item.region,
        besoins: Number(item.besoins || 0)
    }));

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cleanData.map((d) => String(d.region || '').substring(0, 12)),
            datasets: [{
                label: 'Besoins (Ar)',
                data: cleanData.map((d) => d.besoins),
                backgroundColor: 'rgba(29, 84, 108, 0.8)',
                borderColor: '#1D546C',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(26, 61, 100, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return `Valeur: ${formatNumber(context.parsed.y)} Ar`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback(value) {
                            return `${(Number(value) / 1000000).toFixed(1)}M`;
                        }
                    }
                }
            }
        }
    });
}

function renderPieChart(pieData) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    const cleanData = (Array.isArray(pieData) ? pieData : []).filter((d) => Number(d.value || 0) > 0);
    const colors = ['#0C2B4E', '#1A3D64', '#1D546C', '#2980B9', '#1abc9c', '#f39c12'];

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: cleanData.map((d) => d.name),
            datasets: [{
                data: cleanData.map((d) => Number(d.value || 0)),
                backgroundColor: colors.slice(0, cleanData.length),
                borderColor: '#F4F4F4',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, pointStyle: 'circle' }
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
}

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            event.preventDefault();
            const targetElement = document.getElementById(href.substring(1));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('active');
            }
        });
    });
}

async function loadDashboardData() {
    const response = await fetch('/api/dashboard', {
        headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success || !payload.data) {
        throw new Error(payload.message || 'Réponse API invalide');
    }

    return payload.data;
}

async function initDashboard() {
    initMobileMenu();
    initSmoothScroll();

    try {
        const data = await loadDashboardData();
        renderStatsCards(data.stats || {});
        renderTable(data.table || []);
        renderBarChart(data.bar || []);
        renderPieChart(data.pie || []);
    } catch (error) {
        console.error('Erreur dashboard:', error);
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = '<div class="stat-card"><div class="stat-content"><div class="stat-label">Impossible de charger les données dashboard.</div></div></div>';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
