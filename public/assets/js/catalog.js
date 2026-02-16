(function () {
    const FALLBACK_IMAGE = '/assets/images/default-object.svg';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(Number(price) || 0);
    }

    function buildCard(objet) {
        const description = objet.description || '';
        const shortDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description;
        const image = objet.image_principale || FALLBACK_IMAGE;
        const owner = `${objet.proprietaire_prenom || ''} ${objet.proprietaire_nom || ''}`.trim() || 'Utilisateur';

        return `
            <a href="/produit/${objet.id}" class="item-card-link">
                <div class="item-card">
                    <img src="${escapeHtml(image)}"
                         alt="${escapeHtml(objet.nom)}"
                         class="item-image"
                         onerror="this.src='${FALLBACK_IMAGE}'">
                    <div class="item-content">
                        <span class="item-category-badge">${escapeHtml(objet.categorie || 'Non catégorisé')}</span>
                        <h3 class="item-title">${escapeHtml(objet.nom)}</h3>
                        <p class="item-description">${escapeHtml(shortDescription)}</p>
                        <div class="item-footer">
                            <span class="item-price">${formatPrice(objet.prix)} Ar</span>
                            <span class="item-owner">${escapeHtml(owner)}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    async function initCataloguePage() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilters = document.getElementById('categoryFilters');
        const catalogGrid = document.getElementById('catalogGrid');
        const noResults = document.getElementById('noResults');

        if (!searchInput || !categoryFilters || !catalogGrid || !noResults) {
            return;
        }

        let currentCategory = '';
        let searchTimeout;

        async function updateCategoryCounters() {
            const search = searchInput.value.trim();
            let url = '/api/catalogue/categories-count';

            if (search) {
                url += `?search=${encodeURIComponent(search)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                return;
            }

            let totalCount = 0;
            data.data.forEach((cat) => {
                const countSpan = document.getElementById(`count-${cat.id}`);
                if (countSpan) {
                    countSpan.textContent = `(${cat.nombre_objets})`;
                }
                totalCount += Number(cat.nombre_objets) || 0;
            });

            const countAll = document.getElementById('countAll');
            if (countAll) {
                countAll.textContent = `(${totalCount})`;
            }
        }

        function displayObjects(objets) {
            if (!Array.isArray(objets) || objets.length === 0) {
                catalogGrid.innerHTML = '';
                noResults.style.display = 'block';
                return;
            }

            noResults.style.display = 'none';
            catalogGrid.innerHTML = objets.map(buildCard).join('');
        }

        async function loadObjects() {
            const search = searchInput.value.trim();
            const params = new URLSearchParams();

            if (search) {
                params.set('search', search);
            }
            if (currentCategory) {
                params.set('categorie', currentCategory);
            }

            const query = params.toString();
            const url = query ? `/api/catalogue/objets?${query}` : '/api/catalogue/objets';

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                return;
            }

            displayObjects(data.data);
            await updateCategoryCounters();
        }

        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadObjects().catch(console.error);
            }, 350);
        });

        categoryFilters.addEventListener('click', function (e) {
            const btn = e.target.closest('.category-btn');
            if (!btn) {
                return;
            }

            document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.dataset.category || '';
            loadObjects().catch(console.error);
        });

        updateCategoryCounters().catch(console.error);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initCataloguePage().catch(console.error);
    });
})();
