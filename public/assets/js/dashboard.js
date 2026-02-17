var barChartInstance = null;
var pieChartInstance = null;

function formatNumber(value) {
    return Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

function createSVGIcon(iconName) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    
    if (iconName === 'map') {
        var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '10');
        circle.setAttribute('r', '3');
        svg.appendChild(path1);
        svg.appendChild(circle);
    } else if (iconName === 'building') {
        var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
        var path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M9 22V12h6v10');
        svg.appendChild(path1);
        svg.appendChild(path2);
    } else if (iconName === 'clipboard') {
        var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2');
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '9');
        rect.setAttribute('y', '3');
        rect.setAttribute('width', '6');
        rect.setAttribute('height', '4');
        rect.setAttribute('rx', '1');
        svg.appendChild(path1);
        svg.appendChild(rect);
    } else if (iconName === 'gift') {
        var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', '20 12 20 22 4 22 4 12');
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '2');
        rect.setAttribute('y', '7');
        rect.setAttribute('width', '20');
        rect.setAttribute('height', '5');
        var path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M12 22V7');
        svg.appendChild(polyline);
        svg.appendChild(rect);
        svg.appendChild(path1);
    } else if (iconName === 'truck') {
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '1');
        rect.setAttribute('y', '3');
        rect.setAttribute('width', '15');
        rect.setAttribute('height', '13');
        var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '16 8 20 8 23 11 23 16 16 16 16 8');
        var circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', '5.5');
        circle1.setAttribute('cy', '18.5');
        circle1.setAttribute('r', '2.5');
        var circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', '18.5');
        circle2.setAttribute('cy', '18.5');
        circle2.setAttribute('r', '2.5');
        svg.appendChild(rect);
        svg.appendChild(polygon);
        svg.appendChild(circle1);
        svg.appendChild(circle2);
    } else if (iconName === 'dollar') {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '12');
        line.setAttribute('y1', '1');
        line.setAttribute('x2', '12');
        line.setAttribute('y2', '23');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6');
        svg.appendChild(line);
        svg.appendChild(path);
    }
    
    return svg;
}

function renderStatsCards(stats) {
    var statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.textContent = '';
    
    var statsConfig = [
        { label: 'Régions', value: stats.regions, icon: 'map', colorClass: 'primary' },
        { label: 'Villes', value: stats.villes, icon: 'building', colorClass: 'secondary' },
        { label: 'Besoins enregistrés', value: stats.besoins, icon: 'clipboard', colorClass: 'accent' },
        { label: 'Dons reçus', value: stats.dons, icon: 'gift', colorClass: 'primary' },
        { label: 'Distributions', value: stats.distributions, icon: 'truck', colorClass: 'secondary' },
        { label: 'Valeur dons estimée (Ar)', value: formatNumber(stats.valeur_dons_estimee), icon: 'dollar', colorClass: 'accent' }
    ];
    
    for (var i = 0; i < statsConfig.length; i++) {
        var stat = statsConfig[i];
        var card = document.createElement('div');
        card.className = 'stat-card';
        card.id = 'stats';
        
        var iconDiv = document.createElement('div');
        iconDiv.className = 'stat-icon ' + stat.colorClass;
        iconDiv.appendChild(createSVGIcon(stat.icon));
        
        var contentDiv = document.createElement('div');
        contentDiv.className = 'stat-content';
        
        var valueDiv = document.createElement('div');
        valueDiv.className = 'stat-value';
        valueDiv.textContent = stat.value;
        
        var labelDiv = document.createElement('div');
        labelDiv.className = 'stat-label';
        labelDiv.textContent = stat.label;
        
        contentDiv.appendChild(valueDiv);
        contentDiv.appendChild(labelDiv);
        
        card.appendChild(iconDiv);
        card.appendChild(contentDiv);
        
        statsContainer.appendChild(card);
    }
}

function renderTable(rows) {
    var tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    tableBody.textContent = '';

    if (!rows || rows.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'Aucune donnée disponible.';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var tr = document.createElement('tr');
        
        var tdVille = document.createElement('td');
        tdVille.textContent = row.ville;
        
        var tdRegion = document.createElement('td');
        tdRegion.textContent = row.region || '—';
        
        var tdBesoins = document.createElement('td');
        tdBesoins.textContent = row.besoins;
        
        var tdValue = document.createElement('td');
        tdValue.textContent = formatNumber(row.value) + ' Ar';
        
        tr.appendChild(tdVille);
        tr.appendChild(tdRegion);
        tr.appendChild(tdBesoins);
        tr.appendChild(tdValue);
        
        tableBody.appendChild(tr);
    }
}

function renderBarChart(barData) {
    var ctx = document.getElementById('barChart');
    if (!ctx) return;

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    var cleanData = [];
    if (barData) {
        for (var i = 0; i < barData.length; i++) {
            cleanData.push({
                region: barData[i].region,
                besoins: Number(barData[i].besoins || 0)
            });
        }
    }

    var labels = [];
    var dataValues = [];
    for (var i = 0; i < cleanData.length; i++) {
        var regionStr = String(cleanData[i].region || '');
        labels.push(regionStr.substring(0, 12));
        dataValues.push(cleanData[i].besoins);
    }

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Besoins (Ar)',
                data: dataValues,
                backgroundColor: 'rgba(29, 84, 108, 0.8)',
                borderColor: '#1D546C',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (Number(value) / 1000000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });
}

function renderPieChart(pieData) {
    var ctx = document.getElementById('pieChart');
    if (!ctx) return;

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    var cleanData = [];
    if (pieData) {
        for (var i = 0; i < pieData.length; i++) {
            if (Number(pieData[i].value || 0) > 0) {
                cleanData.push(pieData[i]);
            }
        }
    }
    
    var colors = ['#0C2B4E', '#1A3D64', '#1D546C', '#2980B9', '#1abc9c', '#f39c12'];
    var labels = [];
    var dataValues = [];
    for (var i = 0; i < cleanData.length; i++) {
        labels.push(cleanData[i].name);
        dataValues.push(Number(cleanData[i].value || 0));
    }

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: colors.slice(0, cleanData.length),
                borderColor: '#F4F4F4',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, pointStyle: 'circle' }
                }
            },
            cutout: '60%'
        }
    });
}

function initMobileMenu() {
    var menuToggle = document.querySelector('.menu-toggle');
    var sidebar = document.querySelector('.sidebar');

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
}

function initSmoothScroll() {
    var navLinks = document.querySelectorAll('.nav-link');

    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function(event) {
            var href = this.getAttribute('href');
            if (!href || href.charAt(0) !== '#') return;

            event.preventDefault();
            var targetId = href.substring(1);
            var targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            if (window.innerWidth <= 768) {
                var sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('active');
            }
        });
    }
}

function loadDashboardData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/dashboard', true);
    xhr.setRequestHeader('Accept', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
                var data = response.data;
                renderStatsCards(data.stats || {});
                renderTable(data.table || []);
                renderBarChart(data.bar || []);
                renderPieChart(data.pie || []);
            } else {
                var statsContainer = document.getElementById('stats-container');
                if (statsContainer) {
                    statsContainer.textContent = 'Erreur de chargement des données.';
                }
            }
        } else {
            var statsContainer = document.getElementById('stats-container');
            if (statsContainer) {
                statsContainer.textContent = 'Impossible de charger les données dashboard.';
            }
        }
    };
    
    xhr.onerror = function() {
        var statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.textContent = 'Erreur réseau.';
        }
    };
    
    xhr.send();
}

function initDashboard() {
    initMobileMenu();
    initSmoothScroll();
    loadDashboardData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
