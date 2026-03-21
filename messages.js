// messages.js
function loadMessages() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  
  if (messages.length === 0) {
    container.innerHTML = '<p class="no-messages">No messages yet.</p>';
    return;
  }

  container.innerHTML = '';
  messages.forEach(msg => {
    const card = document.createElement('div');
    card.className = `message-card ${!msg.read ? 'unread' : ''}`;
    card.dataset.id = msg.id;
    
    const formattedDate = new Date(msg.date).toLocaleString();
    
    card.innerHTML = `
      <div class="message-header">
        <span class="message-from">${escapeHtml(msg.name)}</span>
        <span class="message-date">${formattedDate}</span>
      </div>
      <div class="message-email"><i class="fas fa-envelope"></i> <a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></div>
      ${msg.phone ? `<div class="message-phone"><i class="fas fa-phone"></i> <a href="tel:${escapeHtml(msg.phone)}">${escapeHtml(msg.phone)}</a></div>` : ''}
      <div class="message-content">${escapeHtml(msg.message).replace(/\n/g, '<br>')}</div>
      <div class="message-actions">
        ${!msg.read ? `<button class="mark-read-btn" data-id="${msg.id}"><i class="fas fa-check"></i> Mark as read</button>` : ''}
        <button class="delete-message-btn" data-id="${msg.id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach event listeners
  document.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      markMessageRead(id);
    });
  });
  document.querySelectorAll('.delete-message-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      deleteMessage(id);
    });
  });
}

function markMessageRead(id) {
  let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  const msg = messages.find(m => m.id === id);
  if (msg) msg.read = true;
  localStorage.setItem('contactMessages', JSON.stringify(messages));
  loadMessages(); // refresh
}

function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  messages = messages.filter(m => m.id !== id);
  localStorage.setItem('contactMessages', JSON.stringify(messages));
  loadMessages(); // refresh
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}