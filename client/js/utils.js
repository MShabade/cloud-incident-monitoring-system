export function escapeHtml(str = '') {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function severityBadge(s) {
  const cls = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }[s] || 'low';
  return `<span class="badge badge-${cls}">${escapeHtml(s)}</span>`;
}

export function statusBadge(s) {
  const cls = s?.toLowerCase() || 'investigating';
  return `<span class="badge badge-${cls}">${escapeHtml(s)}</span>`;
}

export function slaRemaining(deadline) {
  if (!deadline) return { text: '—', cls: '' };
  const ms = new Date(deadline) - Date.now();
  if (ms <= 0) return { text: 'SLA BREACHED', cls: 'breached' };
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
  return { text, cls: mins < 30 ? 'warning' : '' };
}

export function toast(msg, duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function canModify(user) {
  return user && user.role !== 'Guest';
}

export function isAdmin(user) {
  return user?.role === 'Administrator';
}
