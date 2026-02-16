(function () {
    let currentSlide = 0;

    function showToast(title, description = '', duration = 2500) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const toastTitle = toast.querySelector('.toast-title');
        const toastDescription = toast.querySelector('.toast-description');

        if (toastTitle) toastTitle.textContent = title;
        if (toastDescription) toastDescription.textContent = description;

        toast.classList.add('show', 'success');
        setTimeout(() => toast.classList.remove('show'), duration);
    }

    function getProductIdFromUrl() {
        const match = window.location.pathname.match(/\/produit\/(\d+)/);
        return match ? Number(match[1]) : null;
    }

    function goToSlide(index) {
        const carouselImages = document.getElementById('carouselImages');
        const indicators = document.querySelectorAll('#carouselIndicators .indicator');
        if (!carouselImages) return;

        currentSlide = index;
        carouselImages.style.transform = `translateX(-${currentSlide * 100}%)`;

        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        const images = document.querySelectorAll('#carouselImages .carousel-image');
        if (images.length <= 1) return;
        currentSlide = (currentSlide + 1) % images.length;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        const images = document.querySelectorAll('#carouselImages .carousel-image');
        if (images.length <= 1) return;
        currentSlide = (currentSlide - 1 + images.length) % images.length;
        goToSlide(currentSlide);
    }

    function openModal() {
        const modal = document.getElementById('exchangeModal');
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('exchangeModal');
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    async function fetchMyItems() {
        const response = await fetch('/api/mes-objets');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Impossible de charger vos objets');
        }

        return data.data || [];
    }

    async function proposeExchange(myItemId, wantedItemId) {
        const payload = new URLSearchParams();
        payload.set('objet_propose_id', String(myItemId));
        payload.set('objet_demande_id', String(wantedItemId));

        const response = await fetch('/api/echanges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: payload.toString()
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Impossible d\'envoyer la proposition');
        }

        return result;
    }

    function renderExchangeItems(items, wantedItemId) {
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        if (!items.length) {
            modalBody.innerHTML = `
                <div class="no-items-message">
                    Vous n'avez pas encore d'objets.
                    <a href="/mes-objets">Ajouter un objet</a>
                </div>
            `;
            return;
        }

        modalBody.innerHTML = items.map((item) => {
            const title = item.nom || 'Objet';
            const price = new Intl.NumberFormat('fr-FR').format(Number(item.prix) || 0);
            const image = item.image || '/assets/images/default-object.svg';

            return `
                <button class="exchange-item" data-item-id="${item.id}">
                    <img src="${image}" alt="${title}" class="exchange-item-image">
                    <div class="exchange-item-info">
                        <p class="exchange-item-title">${title}</p>
                        <p class="exchange-item-price">${price} Ar</p>
                    </div>
                </button>
            `;
        }).join('');

        modalBody.querySelectorAll('.exchange-item').forEach((button) => {
            button.addEventListener('click', async function () {
                try {
                    const myItemId = Number(this.dataset.itemId);
                    const result = await proposeExchange(myItemId, wantedItemId);
                    showToast('Proposition envoyée', result.message || 'Succès');
                    closeModal();
                } catch (error) {
                    showToast('Erreur', error.message || 'Action impossible');
                }
            });
        });
    }

    function initProductPage() {
        const exchangeButton = document.getElementById('exchangeButton');
        if (!exchangeButton) return;

        const wantedItemId = getProductIdFromUrl();

        document.getElementById('carouselPrev')?.addEventListener('click', prevSlide);
        document.getElementById('carouselNext')?.addEventListener('click', nextSlide);

        document.querySelectorAll('#carouselIndicators .indicator').forEach((indicator) => {
            indicator.addEventListener('click', function () {
                goToSlide(Number(this.dataset.index || 0));
            });
        });

        exchangeButton.addEventListener('click', async function () {
            if (!wantedItemId) {
                showToast('Erreur', 'Objet invalide');
                return;
            }

            try {
                const myItems = await fetchMyItems();
                renderExchangeItems(myItems, wantedItemId);
                openModal();
            } catch (error) {
                showToast('Erreur', error.message || 'Impossible de charger vos objets');
            }
        });

        document.getElementById('modalClose')?.addEventListener('click', closeModal);
        document.getElementById('modalOverlay')?.addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModal();
            }
            if (e.key === 'ArrowLeft') {
                prevSlide();
            }
            if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initProductPage);
})();
