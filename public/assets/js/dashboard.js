// ============================================
// BNGRC Dashboard - Data Management & DOM Manipulation
// ============================================

// Sample Data (simulating the store)
const mockData = {
    regions: [
        { id: 1, nom: "Analamanga" },
        { id: 2, nom: "Vakinankaratra" },
        { id: 3, nom: "Itasy" },
        { id: 4, nom: "Bongolava" },
        { id: 5, nom: "Haute Matsiatra" }
    ],
    villes: [
        { id: 1, nom: "Antananarivo", regionId: 1 },
        { id: 2, nom: "Antsirabe", regionId: 2 },
        { id: 3, nom: "Ambatolampy", regionId: 2 },
        { id: 4, nom: "Miarinarivo", regionId: 3 },
        { id: 5, nom: "Soavinandriana", regionId: 3 },
        { id: 6, nom: "Tsiroanomandidy", regionId: 4 },
        { id: 7, nom: "Fianarantsoa", regionId: 5 },
        { id: 8, nom: "Ambositra", regionId: 5 },
        { id: 9, nom: "Arivonimamo", regionId: 1 },
        { id: 10, nom: "Manjakandriana", regionId: 1 }
    ],
    besoins: [
        { id: 1, villeId: 1, type: "nature", quantite: 500, prixUnitaire: 5000, description: "Riz" },
        { id: 2, villeId: 1, type: "materiaux", quantite: 200, prixUnitaire: 15000, description: "Tôles" },
        { id: 3, villeId: 2, type: "nature", quantite: 300, prixUnitaire: 4000, description: "Haricots" },
        { id: 4, villeId: 3, type: "argent", quantite: 1, prixUnitaire: 5000000, description: "Aide financière" },
        { id: 5, villeId: 4, type: "materiaux", quantite: 150, prixUnitaire: 12000, description: "Ciment" },
        { id: 6, villeId: 5, type: "nature", quantite: 400, prixUnitaire: 3500, description: "Huile" },
        { id: 7, villeId: 6, type: "nature", quantite: 250, prixUnitaire: 6000, description: "Sucre" },
        { id: 8, villeId: 7, type: "materiaux", quantite: 100, prixUnitaire: 20000, description: "Bois" },
        { id: 9, villeId: 8, type: "argent", quantite: 1, prixUnitaire: 3000000, description: "Reconstruction" },
        { id: 10, villeId: 9, type: "nature", quantite: 350, prixUnitaire: 4500, description: "Vêtements" }
    ],
    dons: [
        { id: 1, villeId: 1, quantite: 200, valeur: 1000000, type: "nature" },
        { id: 2, villeId: 2, quantite: 100, valeur: 500000, type: "argent" },
        { id: 3, villeId: 3, quantite: 50, valeur: 750000, type: "materiaux" },
        { id: 4, villeId: 4, quantite: 150, valeur: 800000, type: "nature" }
    ],
    distributions: [
        { id: 1, donId: 1, villeId: 1, quantite: 100 },
        { id: 2, donId: 2, villeId: 2, quantite: 50 },
        { id: 3, donId: 3, villeId: 3, quantite: 30 }
    ]
};

// ============================================
// Calculations
// ============================================

function calculateStats() {
    const totalBesoins = mockData.besoins.reduce((sum, b) => sum + (b.quantite * b.prixUnitaire), 0);
    const totalDons = mockData.dons.reduce((sum, d) => sum + d.valeur, 0);
    const totalDistribue = mockData.distributions.reduce((sum, d) => {
        const don = mockData.dons.find(x => x.id === d.donId);
        return sum + (don ? don.valeur * (d.quantite / don.quantite) : 0);
    }, 0);

    return {
        regions: mockData.regions.length,
        villes: mockData.villes.length,
        besoins: mockData.besoins.length,
        dons: mockData.dons.length,
        distributions: mockData.distributions.length,
        valeurDons: totalDons
    };
}

// ============================================
// SVG Icons Generator
// ============================================

const icons = {
    map: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>`,
    building: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <path d="M9 22V12h6v10"></path>
    </svg>`,
    clipboard: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
        <rect x="9" y="3" width="6" height="4" rx="1"></rect>
    </svg>`,
    gift: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <path d="M12 22V7"></path>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>`,
    truck: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>`,
    dollar: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>`
};

// ============================================
// Render Stats Cards
// ============================================

function renderStatsCards() {
    const stats = calculateStats();
    const statsContainer = document.getElementById('stats-container');
    
    const statsConfig = [
        { label: 'Régions', value: stats.regions, icon: 'map', colorClass: 'primary' },
        { label: 'Villes', value: stats.villes, icon: 'building', colorClass: 'secondary' },
        { label: 'Besoins enregistrés', value: stats.besoins, icon: 'clipboard', colorClass: 'accent' },
        { label: 'Dons reçus', value: stats.dons, icon: 'gift', colorClass: 'primary' },
        { label: 'Distributions', value: stats.distributions, icon: 'truck', colorClass: 'secondary' },
        { label: 'Valeur dons (Ar)', value: stats.valeurDons.toLocaleString('fr-FR'), icon: 'dollar', colorClass: 'accent' }
    ];

    statsContainer.innerHTML = statsConfig.map(stat => `
        <div class="stat-card">
            <div class="stat-icon ${stat.colorClass}">
                ${icons[stat.icon]}
            </div>
            <div class="stat-content">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// Render Table
// ============================================

function renderTable() {
    const tableBody = document.getElementById('table-body');
    
    const tableRows = mockData.villes.slice(0, 10).map(ville => {
        const region = mockData.regions.find(r => r.id === ville.regionId);
        const villeBesoins = mockData.besoins.filter(b => b.villeId === ville.id);
        const totalValue = villeBesoins.reduce((sum, b) => sum + (b.quantite * b.prixUnitaire), 0);
        
        return `
            <tr>
                <td>${ville.nom}</td>
                <td>${region ? region.nom : '—'}</td>
                <td>${villeBesoins.length}</td>
                <td>${totalValue.toLocaleString('fr-FR')} Ar</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableRows;
}

// ============================================
// Chart: Bar Chart - Besoins par région
// ============================================

function renderBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    const barData = mockData.regions.map(region => {
        const regionVilles = mockData.villes.filter(v => v.regionId === region.id);
        const regionBesoins = mockData.besoins.filter(b => 
            regionVilles.some(v => v.id === b.villeId)
        );
        const total = regionBesoins.reduce((sum, b) => sum + (b.quantite * b.prixUnitaire), 0);
        
        return {
            region: region.nom.substring(0, 12),
            besoins: total
        };
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: barData.map(d => d.region),
            datasets: [{
                label: 'Besoins (Ar)',
                data: barData.map(d => d.besoins),
                backgroundColor: 'rgba(29, 84, 108, 0.8)',
                borderColor: '#1D546C',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(26, 61, 100, 0.9)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 43, 78, 0.95)',
                    titleFont: {
                        family: "'Barlow Condensed', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Barlow', sans-serif",
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Valeur: ' + context.parsed.y.toLocaleString('fr-FR') + ' Ar';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(12, 43, 78, 0.08)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Barlow', sans-serif",
                            size: 11
                        },
                        color: '#1A3D64',
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Barlow', sans-serif",
                            size: 11
                        },
                        color: '#1A3D64'
                    }
                }
            }
        }
    });
}

// ============================================
// Chart: Pie Chart - Répartition des besoins
// ============================================

function renderPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    const pieData = [
        { name: 'En nature', value: mockData.besoins.filter(b => b.type === 'nature').length },
        { name: 'Matériaux', value: mockData.besoins.filter(b => b.type === 'materiaux').length },
        { name: 'Argent', value: mockData.besoins.filter(b => b.type === 'argent').length }
    ].filter(d => d.value > 0);

    const colors = ['#0C2B4E', '#1A3D64', '#1D546C', '#2980B9'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: pieData.map(d => d.name),
            datasets: [{
                data: pieData.map(d => d.value),
                backgroundColor: colors.slice(0, pieData.length),
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
                    labels: {
                        font: {
                            family: "'Barlow', sans-serif",
                            size: 13,
                            weight: '600'
                        },
                        color: '#0C2B4E',
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 43, 78, 0.95)',
                    titleFont: {
                        family: "'Barlow Condensed', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Barlow', sans-serif",
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// ============================================
// Mobile Menu Toggle
// ============================================

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

// ============================================
// Smooth Scroll for Navigation
// ============================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Close mobile menu after navigation
                if (window.innerWidth <= 768) {
                    document.querySelector('.sidebar').classList.remove('active');
                }
            }
        });
    });
}

// ============================================
// Intersection Observer for Animations
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.stat-card, .chart-card, .table-card');
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// Initialize Dashboard
// ============================================

function initDashboard() {
    renderStatsCards();
    renderTable();
    renderBarChart();
    renderPieChart();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    
    console.log('✅ BNGRC Dashboard initialized successfully');
}

// ============================================
// Load on DOM Ready
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// ============================================
// Export functions for external use (if needed)
// ============================================

window.BNGRCDashboard = {
    renderStatsCards,
    renderTable,
    renderBarChart,
    renderPieChart,
    mockData
};
