(function () {
    async function parseJsonSafe(response) {
        try {
            return await response.json();
        } catch (_) {
            return null;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('profileForm');
        const messageEl = document.getElementById('profileMessage');
        if (!form || !messageEl) return;

        function setMessage(text, type) {
            messageEl.textContent = text || '';
            messageEl.classList.remove('success', 'error');
            if (type) {
                messageEl.classList.add(type);
            }
        }

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            setMessage('Enregistrement...', '');

            const formData = new FormData(form);

            try {
                const response = await fetch('/api/profile', {
                    method: 'POST',
                    body: formData
                });

                const data = await parseJsonSafe(response);
                if (!response.ok || !data || data.success !== true) {
                    const error = data && data.message ? data.message : 'Échec de mise à jour';
                    setMessage(error, 'error');
                    return;
                }

                setMessage(data.message || 'Profil mis à jour', 'success');
            } catch (_) {
                setMessage('Erreur réseau', 'error');
            }
        });
    });
})();
