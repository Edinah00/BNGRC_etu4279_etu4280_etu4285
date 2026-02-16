// Script pour la connexion admin
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (!adminLoginForm) return;
    
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
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Connexion réussie!', 'Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect || '/admin/dashboard';
                }, 1000);
            } else {
                showToast('Erreur', data.message || 'Identifiants incorrects', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showToast('Erreur', 'Une erreur est survenue', 'error');
        }
    });
    
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