import { initAuth } from './auth.js';
import { initTheme, bindThemeToggle } from './theme.js';
import { initRouter, getCurrentView } from './router.js';
import { setupSocketHandlers } from './incidents.js';
import { canModify } from './utils.js';

let socket = null;

function showApp(user) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  const initials = (user.username || 'U').slice(0, 2).toUpperCase();
  document.getElementById('userInitials').textContent = initials;
  document.getElementById('userName').textContent = user.username;
  document.getElementById('userRole').textContent = user.role === 'Administrator' ? 'Admin' : user.role;

  if (!canModify(user)) {
    document.getElementById('navCreate')?.classList.add('hidden');
  }

  initRouter(user);
  connectSocket();
  setupSocketHandlers();
}

function connectSocket() {
  if (socket || typeof io === 'undefined') return;
  socket = io();
  ['incident:created', 'incident:updated', 'incident:deleted'].forEach((event) => {
    socket.on(event, () => {
      window.dispatchEvent(new CustomEvent('incident:socket', { detail: { type: event } }));
      const { view } = getCurrentView();
      if (view === 'dashboard') {
        import('./dashboard.js').then((m) => m.loadDashboard(false));
      }
    });
  });
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  socket?.disconnect();
  location.reload();
});

initTheme();
bindThemeToggle();

const token = localStorage.getItem('token');
const userRaw = localStorage.getItem('user');

if (token && userRaw) {
  showApp(JSON.parse(userRaw));
} else {
  initAuth(showApp);
}
