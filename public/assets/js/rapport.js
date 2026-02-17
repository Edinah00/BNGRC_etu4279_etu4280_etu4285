const COLORS = {
    primary: '#0C2B4E',
    secondary: '#1A3D64',
    accent: '#1D546C',
    light: '#F4F4F4'
};

let typeComparisonChart = null;
let globalDistributionChart = null;
let regionalChart = null;

document.addEventListener('DOMContentLoaded', function() {
    loadRapportData();
    updateLastUpdateTime();
});

function loadRapportData() {
    fetch('/api/rapport')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                updateSummaryCards(result.data.summary);
                updateTypeComparisonChart(result.data.by_type);
                updateGlobalDistributionChart(result.data.summary);
                updateRegionalChart(result.data.by_region);
            } else {
                console.error('Erreur:', result.message);
            }
        })
        .catch(error => {
            console.error('Erreur de chargement:', error);
        });
}

function updateSummaryCards(summary) {
    const summaryData = [
        { name: 'Besoins totaux', value: summary.besoins_totaux, color: COLORS.primary },
        { name: 'Dons reçus', value: summary.dons_recus, color: COLORS.secondary },
        { name: 'Distribués', value: summary.distribues, color: COLORS.accent },
        { name: 'Restants', value: summary.restants, color: COLORS.secondary }
    ];

    const container = document.getElementById('summaryCards');
    container.innerHTML = '';

    summaryData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <p class="summary-label">${item.name}</p>
            <p class="summary-value" style="color: ${item.color}">
                ${formatCurrency(item.value)} Ar
            </p>
        `;
        container.appendChild(card);
    });
}

function updateTypeComparisonChart(data) {
    const ctx = document.getElementById('typeComparisonChart').getContext('2d');
    
    if (typeComparisonChart) {
        typeComparisonChart.destroy();
    }

    typeComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.type),
            datasets: [
                {
                    label: 'Besoins',
                    data: data.map(item => item.besoins),
                    backgroundColor: COLORS.primary,
                    borderRadius: 4
                },
                {
                    label: 'Dons',
                    data: data.map(item => item.dons),
                    backgroundColor: COLORS.accent,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y) + ' Ar';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateGlobalDistributionChart(summary) {
    const ctx = document.getElementById('globalDistributionChart').getContext('2d');
    
    if (globalDistributionChart) {
        globalDistributionChart.destroy();
    }

    const chartData = [
        { name: 'Besoins totaux', value: summary.besoins_totaux },
        { name: 'Dons reçus', value: summary.dons_recus },
        { name: 'Distribués', value: summary.distribues },
        { name: 'Restants', value: summary.restants }
    ].filter(item => item.value > 0);

    globalDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map(item => item.name),
            datasets: [{
                data: chartData.map(item => item.value),
                backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.light]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': ' + formatCurrency(value) + ' Ar (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

function updateRegionalChart(data) {
    const ctx = document.getElementById('regionalChart').getContext('2d');
    
    if (regionalChart) {
        regionalChart.destroy();
    }

    regionalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.region.substring(0, 15)),
            datasets: [{
                label: 'Besoins',
                data: data.map(item => item.besoins),
                backgroundColor: COLORS.secondary,
                borderRadius: 4
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
                    callbacks: {
                        label: function(context) {
                            return 'Besoins: ' + formatCurrency(context.parsed.y) + ' Ar';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function refreshRapport() {
    const button = document.getElementById('refreshButton');
    button.disabled = true;
    button.innerHTML = '<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Actualisation...';
    
    loadRapportData();
    
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Actualiser';
        updateLastUpdateTime();
    }, 1000);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR');
    document.getElementById('lastUpdateTime').textContent = timeString;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
}

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
