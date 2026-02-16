// Script pour le dashboard admin
document.addEventListener('DOMContentLoaded', function() {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');
    const categoriesList = document.getElementById('categoriesList');
    
    let editingCategoryId = null;
    
    // Ouvrir le modal pour ajouter
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            openModal('add');
        });
    }
    
    // Gérer les boutons d'édition et suppression
    if (categoriesList) {
        categoriesList.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-cat');
            const deleteBtn = e.target.closest('.delete-cat');
            
            if (editBtn) {
                const id = editBtn.dataset.id;
                const nom = editBtn.dataset.nom;
                const desc = editBtn.dataset.desc;
                openModal('edit', id, nom, desc);
            }
            
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                deleteCategory(id);
            }
        });
    }
    
    // Soumettre le formulaire
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = document.getElementById('categoryId').value;
            const nom = document.getElementById('categoryName').value;
            const description = document.getElementById('categoryDesc').value;
            
            if (id) {
                await updateCategory(id, nom, description);
            } else {
                await createCategory(nom, description);
            }
        });
    }
    
    // Ouvrir le modal
    function openModal(mode = 'add', id = '', nom = '', desc = '') {
        editingCategoryId = id;
        
        const modalTitle = document.getElementById('modalTitle');
        const categoryId = document.getElementById('categoryId');
        const categoryName = document.getElementById('categoryName');
        const categoryDesc = document.getElementById('categoryDesc');
        const submitBtn = document.getElementById('submitBtn');
        
        if (mode === 'add') {
            modalTitle.textContent = 'Nouvelle catégorie';
            categoryId.value = '';
            categoryName.value = '';
            categoryDesc.value = '';
            submitBtn.textContent = 'Ajouter';
        } else {
            modalTitle.textContent = 'Modifier la catégorie';
            categoryId.value = id;
            categoryName.value = nom;
            categoryDesc.value = desc;
            submitBtn.textContent = 'Enregistrer';
        }
        
        categoryModal.classList.add('active');
        categoryName.focus();
    }
    
    // Fermer le modal
    window.closeModal = function() {
        categoryModal.classList.remove('active');
        editingCategoryId = null;
    };
    
    // Créer une catégorie
    async function createCategory(nom, description) {
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: nom,
                    description: description
                })
            });
            
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Réponse serveur invalide');
            }
            
            if (data.success) {
                showToast('Succès', 'Catégorie créée avec succès', 'success');
                closeModal();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('Erreur', data.message || 'Erreur lors de la création', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur', error.message || 'Une erreur est survenue', 'error');
        }
    }
    
    // Mettre à jour une catégorie
    async function updateCategory(id, nom, description) {
        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: nom,
                    description: description
                })
            });
            
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Réponse serveur invalide');
            }
            
            if (data.success) {
                showToast('Succès', 'Catégorie modifiée avec succès', 'success');
                closeModal();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('Erreur', data.message || 'Erreur lors de la modification', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur', error.message || 'Une erreur est survenue', 'error');
        }
    }
    
    // Supprimer une catégorie
    async function deleteCategory(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            });
            
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Réponse serveur invalide');
            }
            
            if (data.success) {
                showToast('Succès', 'Catégorie supprimée avec succès', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('Erreur', data.message || 'Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur', error.message || 'Une erreur est survenue', 'error');
        }
    }
    
    // Afficher un toast
    function showToast(title, message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastTitle = toast.querySelector('.toast-title');
        const toastDesc = toast.querySelector('.toast-description');
        
        if (toastTitle) toastTitle.textContent = title;
        if (toastDesc) toastDesc.textContent = message;
        
        toast.className = 'toast show';
        
        if (type === 'error') {
            toast.style.background = '#dc2626';
        } else {
            toast.style.background = '#16a34a';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Fermer le modal en cliquant sur l'overlay
    if (categoryModal) {
        categoryModal.addEventListener('click', function(e) {
            if (e.target === categoryModal || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }
});