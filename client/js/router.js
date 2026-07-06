import { loadDashboard, destroyDashboard, initDashboard } from './dashboard.js';
import { loadIncidentList, loadIncidentDetail, initIncidents } from './incidents.js';

let currentView = 'dashboard';
let detailId = null;

export function navigate(view, id = null) {
  currentView = view;
  detailId = id;

  document.querySelectorAll('[data-view]').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === view);
    el.classList.toggle('hidden', el.dataset.view !== view);
  });

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === view ||
      (view === 'incident-detail' && btn.dataset.nav === 'incidents') ||
      (view === 'create-incident' && btn.dataset.nav === 'create-incident'));
  });

  if (view === 'dashboard') {
    loadDashboard(true);
  } else if (view === 'incidents') {
    loadIncidentList();
  } else if (view === 'incident-detail' && id) {
    loadIncidentDetail(id);
  }
}

export function initRouter(user, onNavigate) {
  initDashboard((v) => navigate(v));
  initIncidents(user);

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  window.addEventListener('navigate', (e) => {
    const { view, id } = e.detail;
    navigate(view, id);
  });

  navigate('dashboard');
}

export function onViewHidden(view) {
  if (view === 'dashboard') destroyDashboard();
}

export function getCurrentView() {
  return { view: currentView, id: detailId };
}
