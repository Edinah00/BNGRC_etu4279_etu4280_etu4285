// ============================================
// BNGRC Rapport - API Integration Version
// ============================================

// BNGRC Color Palette
const COLORS = {
    primary: '#0C2B4E',
    secondary: '#1A3D64',
    tertiary: '#1D546C',
    accent: '#2980B9',
    light: '#F4F4F4'
};

// Store for chart instances
let chartInstances = {
    typeComparison: null,
    globalDistribution: null,
    regional: null
};

// ============================================
// API Client
// ============================================

const RapportAPI = {
    /**
     * Récupère toutes les statistiques du rapport
     */
    async fetchAll() {
        try {
            const response = await fetch('/api/rapport', {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Erreur API');
            }
            
            return result.data;
        } catch (error) {
            console.error('Erreur fetchAll:', error);
            throw error;
        }
    },

    /**
     * Récupère uniquement le résumé
     */
    async fetchSummary() {
        try {
            const response = await fetch('/api/rapport/summary', {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Erreur fetchSummary:', error);
            throw error;
        }
    },

    /**
     * Récupère les données par type
     */
    async fetchByType() {
        try {
            const response = await fetch('/api/rapport/by-type', {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Erreur fetchByType:', error);
            throw error;
        }
    },

    /**
     * Récupère les données par région
     */
    async fetchByRegion() {
        try {
            const response = await fetch('/api/rapport/by-region', {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Erreur fetchByRegion:', error);
            throw error;
        }
    },

    /**
     * Récupère les données par ville
     */
    async fetchByCity(limit = 20) {
        try {
            const response = await fetch(`/api/rapport/by-city?limit=${limit}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Erreur fetchByCity:', error);
            throw error;
        }
    },

    /**
     * Récupère l'évolution temporelle
     */
    async fetchTimeline(days = 30) {
        try {
            const response = await fetch(`/api/rapport/timeline?days=${days}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : { dons: [], distributions: [] };
        } catch (error) {
            console.error('Erreur fetchTimeline:', error);
            throw error;
        }
    }
};

// ============================================
// Render Summary Cards
// ============================================

function renderSummaryCards(summaryData) {
    const container = document.getElementById('summaryCards');
    if (!container) return;
    
    const cards = [
        {
            name: 'Besoins totaux',
            value: summaryData.besoins_totaux || 0,
            index: 1
        },
        {
            name: 'Dons reçus',
            value: summaryData.dons_recus || 0,
            index: 2
        },
        {
            name: 'Distribués',
            value: summaryData.distribues || 0,
            index: 3
        },
        {
            name: 'Restants',
            value: summaryData.restants || 0,
            index: 4
        }
    ];
    
    const cardsHTML = cards.map(card => `
        <div class="summary-card">
            <p class="summary-label">${escapeHtml(card.name)}</p>
            <p class="summary-value">
                ${formatNumber(card.value)}
                <span class="summary-unit">Ar</span>
            </p>
        </div>
    `).join('');
    
    container.innerHTML = cardsHTML;
}

// ============================================
// Chart: Type Comparison (Bar Chart)
// ============================================

function renderTypeComparisonChart(data) {
    const ctx = document.getElementById('typeComparisonChart');
    if (!ctx) return;
    
    // Détruire l'ancien chart s'il existe
    if (chartInstances.typeComparison) {
        chartInstances.typeComparison.destroy();
    }
    
    const cleanData = Array.isArray(data) ? data : [];
    
    chartInstances.typeComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cleanData.map(d => d.type || ''),
            datasets: [
                {
                    label: 'Besoins',
                    data: cleanData.map(d => d.besoins || 0),
                    backgroundColor: 'rgba(12, 43, 78, 0.85)',
                    borderColor: COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: 'rgba(12, 43, 78, 0.95)'
                },
                {
                    label: 'Dons',
                    data: cleanData.map(d => d.dons || 0),
                    backgroundColor: 'rgba(29, 84, 108, 0.75)',
                    borderColor: COLORS.tertiary,
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: 'rgba(29, 84, 108, 0.85)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Barlow', sans-serif",
                            size: 13,
                            weight: '600'
                        },
                        color: COLORS.primary,
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
                            return context.dataset.label + ': ' + formatNumber(context.parsed.y) + ' Ar';
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
                        color: COLORS.secondary,
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
                            size: 12
                        },
                        color: COLORS.secondary
                    }
                }
            }
        }
    });
}

// ============================================
// Chart: Global Distribution (Pie Chart)
// ============================================

function renderGlobalDistributionChart(summaryData) {
    const ctx = document.getElementById('globalDistributionChart');
    if (!ctx) return;
    
    // Détruire l'ancien chart s'il existe
    if (chartInstances.globalDistribution) {
        chartInstances.globalDistribution.destroy();
    }
    
    const data = [
        { name: 'Besoins totaux', value: summaryData.besoins_totaux || 0 },
        { name: 'Dons reçus', value: summaryData.dons_recus || 0 },
        { name: 'Distribués', value: summaryData.distribues || 0 },
        { name: 'Restants', value: summaryData.restants || 0 }
    ].filter(d => d.value > 0);
    
    const chartColors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.accent];
    
    chartInstances.globalDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: chartColors.slice(0, data.length),
                borderColor: COLORS.light,
                borderWidth: 3,
                hoverOffset: 12
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
                            size: 12,
                            weight: '600'
                        },
                        color: COLORS.primary,
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
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
                            return context.label + ': ' + formatNumber(context.parsed) + ' Ar (' + percentage + '%)';
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// ============================================
// Chart: Regional Needs (Bar Chart)
// ============================================

function renderRegionalChart(data) {
    const ctx = document.getElementById('regionalChart');
    if (!ctx) return;
    
    // Détruire l'ancien chart s'il existe
    if (chartInstances.regional) {
        chartInstances.regional.destroy();
    }
    
    const cleanData = Array.isArray(data) ? data : [];
    
    chartInstances.regional = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cleanData.map(d => (d.region || '').substring(0, 15)),
            datasets: [{
                label: 'Besoins',
                data: cleanData.map(d => d.besoins || 0),
                backgroundColor: 'rgba(26, 61, 100, 0.8)',
                borderColor: COLORS.secondary,
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(26, 61, 100, 0.95)'
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
                            return 'Valeur: ' + formatNumber(context.parsed.y) + ' Ar';
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
                        color: COLORS.secondary,
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
                        color: COLORS.secondary
                    }
                }
            }
        }
    });
}

// ============================================
// Utility Functions
// ============================================

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

function showError(message) {
    const container = document.getElementById('summaryCards');
    if (container) {
        container.innerHTML = `
            <div class="summary-card" style="grid-column: 1 / -1;">
                <p class="summary-label" style="color: #E74C3C;">Erreur</p>
                <p class="summary-value" style="font-size: 1rem; color: #E74C3C;">
                    ${escapeHtml(message)}
                </p>
            </div>
        `;
    }
}

function showLoading() {
    const container = document.getElementById('summaryCards');
    if (container) {
        container.innerHTML = `
            <div class="summary-card" style="grid-column: 1 / -1; text-align: center;">
                <p class="summary-label">Chargement en cours...</p>
                <div style="margin: 1rem auto; width: 40px; height: 40px; border: 4px solid rgba(12, 43, 78, 0.1); border-top-color: #0C2B4E; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
        `;
    }
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
// Initialize Rapport
// ============================================

async function initRapport() {
    console.log('📊 Initializing BNGRC Rapport...');
    
    showLoading();
    
    try {
        // Charger toutes les données en une fois
        const data = await RapportAPI.fetchAll();
        
        if (!data) {
            throw new Error('Aucune donnée reçue de l\'API');
        }
        
        // Rendre tous les composants
        renderSummaryCards(data.summary || {});
        renderTypeComparisonChart(data.by_type || []);
        renderGlobalDistributionChart(data.summary || {});
        renderRegionalChart(data.by_region || []);
        
        console.log('✅ BNGRC Rapport initialized successfully');
        console.log(`📈 Summary loaded:`, data.summary);
        console.log(`📊 ${data.by_type?.length || 0} types, ${data.by_region?.length || 0} regions`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showError('Impossible de charger les données du rapport. Veuillez réessayer.');
    }
    
    // Initialiser le menu mobile
    initMobileMenu();
}

// ============================================
// Load on DOM Ready
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRapport);
} else {
    initRapport();
}

// ============================================
// Export for external use
// ============================================

window.BNGRCRapport = {
    API: RapportAPI,
    renderSummaryCards,
    renderTypeComparisonChart,
    renderGlobalDistributionChart,
    renderRegionalChart,
    formatNumber,
    escapeHtml
};