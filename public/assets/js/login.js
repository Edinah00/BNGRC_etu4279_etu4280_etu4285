// Gestion des onglets
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Gestion du formulaire admin
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            
            try {
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        email: email,
                        password: password
                    })
                });

                const raw = await response.text();
                let data = null;

                try {
                    data = JSON.parse(raw);
                } catch (_) {
                    throw new Error(raw || `Réponse serveur invalide (HTTP ${response.status})`);
                }
                
                if (data.success) {
                    showToast('Connexion réussie!', 'Redirection vers le dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = data.redirect || '/admin/dashboard';
                    }, 1000);
                } else {
                    showToast('Erreur', data.message || 'Identifiants incorrects', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showToast('Erreur', error.message || 'Une erreur est survenue lors de la connexion', 'error');
            }
        });
    }
    
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
});
