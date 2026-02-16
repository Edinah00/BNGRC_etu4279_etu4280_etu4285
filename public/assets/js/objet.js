(function () {
    const FALLBACK_IMAGE = '/assets/images/default-object.svg';
    const CLIENT_UPLOAD_TARGET_BYTES = Math.floor(1.5 * 1024 * 1024); // 1.5 MB
    const CLIENT_HARD_LIMIT_BYTES = 20 * 1024 * 1024; // 20 MB

    let editingItemId = null;
    let uploadedImageName = '';
    let currentObjetId = null;
    let isSubmitting = false;

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

    async function parseApiResponse(response, fallbackMessage) {
        const rawText = await response.text();
        let data = null;

        if (rawText && rawText.trim() !== '') {
            try {
                data = JSON.parse(rawText);
            } catch (error) {
                const snippet = rawText.replace(/\s+/g, ' ').trim().slice(0, 140);
                throw new Error('Réponse serveur invalide: ' + (snippet || 'contenu illisible'));
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || fallbackMessage || 'Erreur serveur');
        }

        if (!data) {
            throw new Error('Réponse serveur vide');
        }

        return data;
    }

    function openModal() {
        const modal = document.getElementById('itemModal');
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('itemModal');
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function openPriceRangeModal() {
        const modal = document.getElementById('priceRangeModal');
        if (!modal) return;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closePriceRangeModal() {
        const modal = document.getElementById('priceRangeModal');
        if (!modal) return;
        modal.classList.remove('show');
        document.body.style.overflow = '';
        currentObjetId = null;
    }

    function setPreview(src) {
        const preview = document.getElementById('imagePreview');
        if (!preview) return;

        if (!src) {
            preview.style.display = 'none';
            preview.removeAttribute('src');
            return;
        }

        preview.src = src;
        preview.style.display = 'block';
    }

    function basename(path) {
        if (!path) return '';
        const parts = String(path).split('/');
        return parts[parts.length - 1];
    }

    function formatPrice(prix) {
        return new Intl.NumberFormat('fr-FR').format(prix) + ' Ar';
    }

    function clearElement(el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    function createMessageParagraph(className, text) {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        return p;
    }

    function loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image invalide'));
                img.src = reader.result;
            };
            reader.onerror = () => reject(new Error('Lecture image impossible'));
            reader.readAsDataURL(file);
        });
    }

    function canvasToBlob(canvas, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Compression image impossible'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', quality);
        });
    }

    async function optimizeImageForUpload(file) {
        if (file.size <= CLIENT_UPLOAD_TARGET_BYTES) {
            return file;
        }

        const img = await loadImageFromFile(file);
        const maxDim = 1920;
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas indisponible');
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let blob = await canvasToBlob(canvas, quality);
        while (blob.size > CLIENT_UPLOAD_TARGET_BYTES && quality > 0.4) {
            quality -= 0.1;
            blob = await canvasToBlob(canvas, quality);
        }

        const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
        return new File([blob], baseName + '.jpg', { type: 'image/jpeg' });
    }

    function createExchangeIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');

        const poly1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly1.setAttribute('points', '17 1 21 5 17 9');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M3 11V9a4 4 0 0 1 4-4h14');

        const poly2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly2.setAttribute('points', '7 23 3 19 7 15');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M21 13v2a4 4 0 0 1-4 4H3');

        svg.appendChild(poly1);
        svg.appendChild(path1);
        svg.appendChild(poly2);
        svg.appendChild(path2);

        return svg;
    }

    function createPriceRangeItem(produit, prixReference, objetProposeId) {
        const diff = ((produit.prix - prixReference) / prixReference) * 100;
        const diffRounded = Math.round(diff);
        const diffClass = diffRounded >= 0 ? 'diff-positive' : 'diff-negative';
        const diffLabel = (diffRounded >= 0 ? '+' : '') + diffRounded + '%';

        const item = document.createElement('div');
        item.className = 'price-range-item';

        const img = document.createElement('img');
        img.src = produit.image;
        img.alt = produit.nom;
        img.className = 'price-range-item-image';
        img.addEventListener('error', function () {
            this.src = FALLBACK_IMAGE;
        });

        const info = document.createElement('div');
        info.className = 'price-range-item-info';

        const nomEl = document.createElement('p');
        nomEl.className = 'price-range-item-nom';
        nomEl.textContent = produit.nom;

        const prixEl = document.createElement('p');
        prixEl.className = 'price-range-item-prix';
        prixEl.textContent = formatPrice(produit.prix) + ' ';

        const diffSpan = document.createElement('span');
        diffSpan.className = diffClass;
        diffSpan.textContent = '(' + diffLabel + ')';
        prixEl.appendChild(diffSpan);

        info.appendChild(nomEl);
        info.appendChild(prixEl);

        const btn = document.createElement('button');
        btn.className = 'btn-echanger';
        btn.appendChild(createExchangeIcon());
        btn.appendChild(document.createTextNode(' Échanger'));
        btn.addEventListener('click', () => {
            createExchange(objetProposeId, produit.id);
        });

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(btn);

        return item;
    }

    async function uploadImageIfNeeded() {
        const imageInput = document.getElementById('itemImage');
        const file = imageInput?.files?.[0];

        // En mode édition, si aucun nouveau fichier n'est choisi,
        // on ne doit pas renvoyer l'ancienne image au backend.
        if (!file) {
            return '';
        }

        if (file.size > CLIENT_HARD_LIMIT_BYTES) {
            throw new Error('Image trop volumineuse (max 20Mo)');
        }

        const uploadFile = await optimizeImageForUpload(file);

        const formData = new FormData();
        formData.append('image', uploadFile);

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });

        const data = await parseApiResponse(response, 'Échec upload image');
        if (!data.success) {
            throw new Error(data.message || 'Échec upload image');
        }

        return basename(data.url);
    }

    function openAddModal() {
        editingItemId = null;
        uploadedImageName = '';
        isSubmitting = false;

        document.getElementById('modalTitle').textContent = 'Ajouter un objet';
        const submitButton = document.getElementById('submitButton');
        submitButton.textContent = 'Ajouter';
        submitButton.disabled = false;
        document.getElementById('itemForm').reset();
        setPreview('');
        openModal();
    }

    function openEditModal(button) {
        editingItemId = button.dataset.id;
        uploadedImageName = basename(button.dataset.image || '');
        isSubmitting = false;

        document.getElementById('modalTitle').textContent = "Modifier l'objet";
        const submitButton = document.getElementById('submitButton');
        submitButton.textContent = 'Enregistrer';
        submitButton.disabled = false;

        document.getElementById('itemTitle').value = button.dataset.nom || '';
        document.getElementById('itemDescription').value = button.dataset.description || '';
        document.getElementById('itemCategory').value = button.dataset.categorie || '';
        document.getElementById('itemPrice').value = button.dataset.prix || '';

        setPreview(button.dataset.image || '');
        openModal();
    }

    async function submitItemForm(e) {
        e.preventDefault();
        if (isSubmitting) {
            return;
        }

        const title = document.getElementById('itemTitle').value.trim();
        const description = document.getElementById('itemDescription').value.trim();
        const categorieId = document.getElementById('itemCategory').value;
        const prix = document.getElementById('itemPrice').value;

        if (!title || !description || !categorieId || !prix) {
            showToast('Erreur', 'Veuillez remplir tous les champs requis');
            return;
        }

        const submitButton = document.getElementById('submitButton');
        isSubmitting = true;
        submitButton.disabled = true;
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Envoi...';

        try {
            const imageName = await uploadImageIfNeeded();
            const payload = new URLSearchParams();
            payload.set('titre', title);
            payload.set('description', description);
            payload.set('categorie_id', categorieId);
            payload.set('prix', prix);
            if (imageName) {
                payload.set('image_url', imageName);
            }

            const isEdit = Boolean(editingItemId);
            const url = isEdit ? '/api/mes-objets/' + editingItemId : '/api/mes-objets';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: payload.toString()
            });

            const result = await parseApiResponse(response, 'Impossible de modifier l\'objet');
            if (!result.success) {
                throw new Error(result.message || 'Opération échouée');
            }

            showToast(isEdit ? 'Objet modifié' : 'Objet ajouté', result.message || 'Succès');
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            showToast('Erreur', error.message || 'Impossible de sauvegarder');
        } finally {
            isSubmitting = false;
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    async function deleteItem(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) {
            return;
        }

        try {
            const response = await fetch('/api/mes-objets/' + id, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const result = await parseApiResponse(response, 'Suppression impossible');

            if (!result.success) {
                throw new Error(result.message || 'Suppression impossible');
            }

            showToast('Objet supprimé', result.message || 'Succès');
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            showToast('Erreur', error.message || 'Suppression impossible');
        }
    }

    async function openPriceRangeList(link) {
        const id = link.dataset.id;
        const range = link.dataset.range;
        const nom = link.dataset.nom;
        const prix = parseFloat(link.dataset.prix);

        currentObjetId = id;

        document.getElementById('priceRangeTitle').textContent =
            'Produits à +/- ' + range + '% de "' + nom + '"';
        document.getElementById('priceRangeRef').textContent =
            'Prix de référence : ' + formatPrice(prix);

        const body = document.getElementById('priceRangeBody');
        clearElement(body);
        body.appendChild(createMessageParagraph('price-range-loading', 'Chargement...'));

        openPriceRangeModal();

        try {
            const response = await fetch('/api/mes-objets/' + id + '/similar?range=' + range);
            const result = await parseApiResponse(response, 'Erreur lors du chargement');

            if (!result.success) {
                throw new Error(result.message || 'Erreur');
            }

            clearElement(body);

            if (!result.data || result.data.length === 0) {
                body.appendChild(createMessageParagraph('price-range-empty', 'Aucun produit trouvé dans cette fourchette.'));
                return;
            }

            result.data.forEach((produit) => {
                body.appendChild(createPriceRangeItem(produit, prix, id));
            });
        } catch (error) {
            clearElement(body);
            body.appendChild(createMessageParagraph('price-range-empty', 'Erreur : ' + error.message));
        }
    }

    async function createExchange(objetProposeId, objetDemandeId) {
        try {
            const payload = new URLSearchParams();
            payload.set('objet_propose_id', objetProposeId);
            payload.set('objet_demande_id', objetDemandeId);

            const response = await fetch('/api/echanges', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                body: payload.toString()
            });

            const result = await parseApiResponse(response, 'Impossible d\'envoyer la proposition');

            if (!result.success) {
                throw new Error(result.message || 'Erreur lors de la proposition');
            }

            closePriceRangeModal();
            showToast('Proposition envoyée', result.message || 'Succès');
        } catch (error) {
            showToast('Erreur', error.message || 'Impossible d\'envoyer la proposition');
        }
    }

    function initMyObjectsPage() {
        const addButton = document.getElementById('addButton');
        const form = document.getElementById('itemForm');
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        const imageInput = document.getElementById('itemImage');
        const priceRangeClose = document.getElementById('priceRangeClose');
        const priceRangeOverlay = document.getElementById('priceRangeOverlay');

        if (!addButton || !form) return;
        if (form.dataset.submitBound === '1') return;
        form.dataset.submitBound = '1';

        addButton.addEventListener('click', openAddModal);
        form.addEventListener('submit', submitItemForm);
        modalClose?.addEventListener('click', closeModal);
        modalOverlay?.addEventListener('click', closeModal);
        priceRangeClose?.addEventListener('click', closePriceRangeModal);
        priceRangeOverlay?.addEventListener('click', closePriceRangeModal);

        imageInput?.addEventListener('change', function () {
            const file = this.files?.[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
        });

        document.querySelectorAll('.btn-edit').forEach((btn) => {
            btn.addEventListener('click', () => openEditModal(btn));
        });

        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id));
        });

        document.querySelectorAll('.price-range-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPriceRangeList(link);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModal();
                closePriceRangeModal();
            }
        });

        document.querySelectorAll('.my-item-image').forEach((img) => {
            img.addEventListener('error', function () {
                this.src = FALLBACK_IMAGE;
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initMyObjectsPage);
})();
