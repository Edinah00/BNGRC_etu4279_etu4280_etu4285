(function () {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(dateValue) {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function jsonFetch(url, options) {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Erreur API');
        }
        return data;
    }

    document.addEventListener('DOMContentLoaded', function () {
        const root = document.querySelector('.messages-main');
        if (!root) return;

        const currentUserId = Number(root.dataset.currentUserId || 0);
        if (!currentUserId) return;

        const conversationList = document.getElementById('conversationList');
        const messageList = document.getElementById('messageList');
        const chatArea = document.getElementById('chatArea');
        const chatPlaceholder = document.getElementById('chatPlaceholder');
        const chatUserName = document.getElementById('chatUserName');
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const globalUnreadBadge = document.getElementById('globalUnreadBadge');
        const newConversationUser = document.getElementById('newConversationUser');
        const startConversationBtn = document.getElementById('startConversationBtn');

        let activeUserId = null;
        let activeUserLabel = '';
        let conversationsState = [];

        function updateUnreadBadge(count) {
            const n = Number(count) || 0;
            if (n <= 0) {
                globalUnreadBadge?.classList.add('hidden');
                if (globalUnreadBadge) globalUnreadBadge.textContent = '0';
                return;
            }
            if (globalUnreadBadge) {
                globalUnreadBadge.textContent = String(n);
                globalUnreadBadge.classList.remove('hidden');
            }
        }

        function renderConversations(items) {
            conversationsState = items;
            if (!Array.isArray(items) || items.length === 0) {
                conversationList.innerHTML = '<div class="conversation-item">Aucune conversation</div>';
                return;
            }

            conversationList.innerHTML = items.map((item) => {
                const otherId = Number(item.other_user_id);
                const fullName = `${item.other_user_prenom || ''} ${item.other_user_nom || ''}`.trim() || item.other_user_mail || `User ${otherId}`;
                const unread = Number(item.unread_count) || 0;
                const last = item.dernier_message || '';
                const date = formatDate(item.dernier_message_at);

                return `
                    <div class="conversation-item ${activeUserId === otherId ? 'active' : ''}" data-user-id="${otherId}" data-user-name="${escapeHtml(fullName)}">
                        <div class="conversation-top">
                            <span class="conversation-name">${escapeHtml(fullName)}</span>
                            <span class="conversation-date">${escapeHtml(date)}</span>
                        </div>
                        <div class="conversation-last">${escapeHtml(last)}</div>
                        ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
                    </div>
                `;
            }).join('');

            conversationList.querySelectorAll('.conversation-item[data-user-id]').forEach((el) => {
                el.addEventListener('click', () => {
                    const userId = Number(el.dataset.userId);
                    const userName = el.dataset.userName || `User ${userId}`;
                    openConversation(userId, userName);
                });
            });
        }

        function renderMessages(messages) {
            if (!Array.isArray(messages) || messages.length === 0) {
                messageList.innerHTML = '<div class="message-bubble other">Aucun message</div>';
                return;
            }

            messageList.innerHTML = messages.map((m) => {
                const mine = Number(m.id_expediteur) === currentUserId;
                const isRead = m.lu === true || m.lu === 1 || m.lu === '1' || m.lu === 't' || m.lu === 'true';
                const status = mine ? (isRead ? 'Vu' : 'Envoyé') : '';
                return `
                    <div class="message-bubble ${mine ? 'mine' : 'other'}">
                        <div class="message-content">${escapeHtml(m.contenu)}</div>
                        <div class="message-meta">${escapeHtml(formatDate(m.date_envoi))}${status ? ` • ${status}` : ''}</div>
                    </div>
                `;
            }).join('');

            messageList.scrollTop = messageList.scrollHeight;
        }

        async function loadUsers() {
            const data = await jsonFetch('/api/messages/users');
            const options = ['<option value="">Choisir un utilisateur</option>'];
            data.data.forEach((u) => {
                const label = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.mail || `User ${u.id}`;
                options.push(`<option value="${u.id}">${escapeHtml(label)}</option>`);
            });
            newConversationUser.innerHTML = options.join('');
        }

        async function loadConversations() {
            const data = await jsonFetch('/api/messages/conversations');
            updateUnreadBadge(data.unread_count);
            renderConversations(data.data || []);
        }

        async function openConversation(otherUserId, userLabel) {
            activeUserId = Number(otherUserId);
            activeUserLabel = userLabel || `User ${activeUserId}`;
            chatUserName.textContent = activeUserLabel;
            chatPlaceholder.classList.add('hidden');
            chatArea.classList.remove('hidden');

            const data = await jsonFetch(`/api/messages/conversation/${activeUserId}`);
            renderMessages(data.data || []);
            await loadConversations();
        }

        async function sendMessage() {
            if (!activeUserId) return;
            const content = (messageInput.value || '').trim();
            if (!content) return;

            const body = new URLSearchParams();
            body.set('receiver_id', String(activeUserId));
            body.set('content', content);

            await jsonFetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: body.toString()
            });

            messageInput.value = '';
            await openConversation(activeUserId, activeUserLabel);
        }

        startConversationBtn?.addEventListener('click', () => {
            const targetId = Number(newConversationUser.value || 0);
            if (!targetId) return;
            const label = newConversationUser.options[newConversationUser.selectedIndex]?.text || `User ${targetId}`;
            openConversation(targetId, label).catch(console.error);
        });

        messageForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage().catch(console.error);
        });

        loadUsers().catch(console.error);
        loadConversations().catch(console.error);
    });
})();
