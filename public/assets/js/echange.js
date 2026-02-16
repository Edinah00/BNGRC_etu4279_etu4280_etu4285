(function () {
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

    function switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach((content) => {
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(tabName === 'sent' ? 'sentTab' : 'receivedTab');
        activeTab?.classList.add('active');
    }

    async function callExchangeAction(url, method, successLabel) {
        try {
            const response = await fetch(url, { method });
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Action impossible');
            }

            showToast(successLabel, result.message || 'Succès');
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            showToast('Erreur', error.message || 'Action impossible');
        }
    }

    function initExchangePage() {
        const tabs = document.querySelectorAll('.tab-button');
        if (tabs.length === 0) return;

        tabs.forEach((btn) => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        document.querySelectorAll('.btn-accept').forEach((btn) => {
            btn.addEventListener('click', () => {
                callExchangeAction(`/api/echanges/${btn.dataset.id}/accept`, 'PUT', 'Échange accepté');
            });
        });

        document.querySelectorAll('.btn-refuse').forEach((btn) => {
            btn.addEventListener('click', () => {
                callExchangeAction(`/api/echanges/${btn.dataset.id}/refuse`, 'PUT', 'Échange refusé');
            });
        });

        document.querySelectorAll('.btn-cancel').forEach((btn) => {
            btn.addEventListener('click', () => {
                callExchangeAction(`/api/echanges/${btn.dataset.id}/cancel`, 'DELETE', 'Proposition annulée');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initExchangePage);
})();
