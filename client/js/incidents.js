import { incidentApi } from './api.js';
import { TAXONOMY, fillSelect, servicesForProvider } from './config.js';
import {
  escapeHtml, formatDate, formatRelative, severityBadge, statusBadge,
  slaRemaining, toast, debounce, canModify, isAdmin
} from './utils.js';

let state = { page: 1, limit: 10, search: '', severity: '', status: '', total: 0 };
let currentUser = null;
let selectedId = null;

export function initIncidents(user) {
  currentUser = user;

  const sevEl = document.getElementById('filterSeverity');
  const statEl = document.getElementById('filterStatus');
  sevEl.innerHTML = '<option value="">All severities</option>' +
    TAXONOMY.severityLevels.map((s) => `<option value="${s}">${s}</option>`).join('');
  statEl.innerHTML = '<option value="">All statuses</option>' +
    TAXONOMY.statusValues.map((s) => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('incidentSearch')?.addEventListener('input', debounce((e) => {
    state.search = e.target.value;
    state.page = 1;
    loadIncidentList();
  }));

  document.getElementById('filterSeverity')?.addEventListener('change', (e) => {
    state.severity = e.target.value;
    state.page = 1;
    loadIncidentList();
  });

  document.getElementById('filterStatus')?.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadIncidentList();
  });

  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (state.page > 1) { state.page--; loadIncidentList(); }
  });

  document.getElementById('nextPage')?.addEventListener('click', () => {
    const pages = Math.ceil(state.total / state.limit);
    if (state.page < pages) { state.page++; loadIncidentList(); }
  });

  initCreateForm();
}

function initCreateForm() {
  fillSelect(document.getElementById('createSeverity'), TAXONOMY.severityLevels, 'Select severity');
  fillSelect(document.getElementById('createStatus'), TAXONOMY.statusValues, 'Select status');
  fillSelect(document.getElementById('createIssueType'), TAXONOMY.issueTypes, 'Select issue type');
  fillSelect(document.getElementById('createProvider'), TAXONOMY.cloudProviders, 'Select provider');
  fillSelect(document.getElementById('createRegion'), TAXONOMY.regions, 'Select region');
  fillSelect(document.getElementById('createTeam'), TAXONOMY.teams, 'Select team');

  const providerEl = document.getElementById('createProvider');
  const serviceEl = document.getElementById('createService');
  providerEl?.addEventListener('change', () => {
    fillSelect(serviceEl, servicesForProvider(providerEl.value), 'Select service');
  });
  fillSelect(serviceEl, [], 'Select service');

  document.getElementById('createForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!canModify(currentUser)) return;

    const body = {
      title: document.getElementById('createTitle').value.trim(),
      description: document.getElementById('createDescription').value.trim(),
      ticketType: 'Incident',
      severity: document.getElementById('createSeverity').value,
      status: document.getElementById('createStatus').value || 'Investigating',
      issueType: document.getElementById('createIssueType').value,
      cloudProvider: document.getElementById('createProvider').value,
      affectedService: document.getElementById('createService').value,
      region: document.getElementById('createRegion').value,
      assignedTeam: document.getElementById('createTeam').value,
      assignedToPerson: document.getElementById('createOwner').value.trim(),
      rootCause: document.getElementById('createRootCause').value.trim()
    };

    try {
      await incidentApi.create(body);
      toast('Incident created successfully');
      document.getElementById('createForm').reset();
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'incidents' } }));
    } catch (err) {
      toast(err.message);
    }
  });
}

export async function loadIncidentList() {
  const tbody = document.getElementById('incidentTableBody');
  tbody.innerHTML = `<tr><td colspan="8"><div class="skeleton skeleton-kpi"></div></td></tr>`;

  try {
    const params = { page: state.page, limit: state.limit };
    if (state.search) params.search = state.search;
    if (state.severity) params.severity = state.severity;
    if (state.status) params.status = state.status;

    const data = await incidentApi.list(params);
    const rows = Array.isArray(data) ? data : (data.incidents || []);
    state.total = Array.isArray(data) ? data.length : (data.pagination?.total || 0);

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h3>No incidents found</h3><p>Adjust filters or create a new incident.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = rows.map((i) => `
        <tr data-id="${i._id}">
          <td><span class="incident-id">${escapeHtml(i.incidentId || '—')}</span></td>
          <td>${escapeHtml(i.title)}</td>
          <td>${severityBadge(i.severity)}</td>
          <td>${statusBadge(i.status)}</td>
          <td>${escapeHtml(i.affectedService)}</td>
          <td>${escapeHtml(i.region || '—')}</td>
          <td>${escapeHtml(i.assignedTeam)}</td>
          <td style="color:var(--text-muted)">${formatRelative(i.detectedAt || i.createdAt)}</td>
        </tr>
      `).join('');

      tbody.querySelectorAll('tr[data-id]').forEach((row) => {
        row.addEventListener('click', () => openDetail(row.dataset.id));
      });
    }

    const from = (state.page - 1) * state.limit + 1;
    const to = Math.min(state.page * state.limit, state.total);
    document.getElementById('paginationInfo').textContent =
      state.total ? `Showing ${from}–${to} of ${state.total}` : 'No results';
    document.getElementById('prevPage').disabled = state.page <= 1;
    document.getElementById('nextPage').disabled = state.page >= Math.ceil(state.total / state.limit);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="error-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

export async function openDetail(id) {
  selectedId = id;
  window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'incident-detail', id } }));
}

export async function loadIncidentDetail(id) {
  const container = document.getElementById('incidentDetailContent');
  container.innerHTML = '<div class="skeleton skeleton-chart"></div>';

  try {
    const inc = await incidentApi.get(id);
    const sla = slaRemaining(inc.slaDeadline);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem">
            <span class="incident-id" style="font-size:1rem">${escapeHtml(inc.incidentId)}</span>
            ${severityBadge(inc.severity)} ${statusBadge(inc.status)}
          </div>
          <h1 class="page-title">${escapeHtml(inc.title)}</h1>
          <p class="page-subtitle">Detected ${formatDate(inc.detectedAt || inc.createdAt)} · ${escapeHtml(inc.cloudProvider)} / ${escapeHtml(inc.affectedService)}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost btn-sm" id="backToList">← Back to incidents</button>
          ${isAdmin(currentUser) ? `<button class="btn btn-ghost btn-sm" id="deleteIncident" style="color:var(--danger)">Delete</button>` : ''}
        </div>
      </div>

      <div class="detail-grid">
        <div>
          <div class="panel">
            <div class="panel-header"><span class="panel-title">Description</span></div>
            <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.6">${escapeHtml(inc.description)}</p>
          </div>

          <div class="panel">
            <div class="panel-header"><span class="panel-title">Root Cause Analysis</span></div>
            ${canModify(currentUser) ? `
              <textarea id="rcaInput" class="form-input" rows="4" placeholder="Document root cause analysis...">${escapeHtml(inc.rootCause || '')}</textarea>
              <button class="btn btn-secondary btn-sm" id="saveRca" style="margin-top:.65rem">Save RCA</button>
            ` : `<p style="font-size:.875rem;color:var(--text-secondary)">${escapeHtml(inc.rootCause || 'Not yet documented.')}</p>`}
          </div>

          <div class="panel">
            <div class="panel-header"><span class="panel-title">Incident Timeline</span></div>
            <div class="timeline">
              ${(inc.timeline || []).slice().reverse().map((t) => `
                <div class="timeline-item">
                  <div class="timeline-time">${formatDate(t.timestamp)}</div>
                  <div class="timeline-msg">${escapeHtml(t.message)}</div>
                  <div class="timeline-author">${escapeHtml(t.author)} · ${escapeHtml(t.type)}</div>
                </div>
              `).join('') || '<p style="color:var(--text-muted);font-size:.8125rem">No timeline events</p>'}
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><span class="panel-title">Comments & Updates</span></div>
            ${(inc.comments || []).map((c) => `
              <div class="comment">
                <span class="comment-author">${escapeHtml(c.author)}</span>
                <span class="comment-time">${formatRelative(c.createdAt)}</span>
                <div class="comment-text">${escapeHtml(c.text)}</div>
              </div>
            `).join('') || '<p style="color:var(--text-muted);font-size:.8125rem;margin-bottom:.75rem">No comments yet</p>'}
            ${canModify(currentUser) ? `
              <div class="comment-form">
                <input type="text" id="commentInput" class="form-input" placeholder="Add an update...">
                <button class="btn btn-primary btn-sm" id="postComment" style="width:auto">Post</button>
              </div>
            ` : ''}
          </div>
        </div>

        <div>
          <div class="panel sla-timer ${sla.cls}">
            <div class="kpi-label">Resolution SLA</div>
            <div class="sla-time">${sla.text}</div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:.35rem">Deadline: ${formatDate(inc.slaDeadline)}</div>
          </div>

          <div class="panel">
            <div class="panel-header"><span class="panel-title">Details</span></div>
            <div class="meta-grid">
              <div class="meta-item"><label>Service Impacted</label><span>${escapeHtml(inc.affectedService)}</span></div>
              <div class="meta-item"><label>Region</label><span>${escapeHtml(inc.region || '—')}</span></div>
              <div class="meta-item"><label>Cloud Provider</label><span>${escapeHtml(inc.cloudProvider)}</span></div>
              <div class="meta-item"><label>Issue Type</label><span>${escapeHtml(inc.issueType)}</span></div>
              <div class="meta-item"><label>Assigned Team</label><span>${escapeHtml(inc.assignedTeam)}</span></div>
              <div class="meta-item"><label>Owner</label><span>${escapeHtml(inc.assignedToPerson || 'Unassigned')}</span></div>
              <div class="meta-item"><label>Source</label><span>${escapeHtml(inc.source)}</span></div>
              <div class="meta-item"><label>Cost Impact</label><span>$${Number(inc.costImpact || 0).toLocaleString()}</span></div>
            </div>
          </div>

          ${canModify(currentUser) ? `
            <div class="panel">
              <div class="panel-header"><span class="panel-title">Update Status</span></div>
              <select id="detailStatus" class="form-input" style="margin-bottom:.65rem">
                ${TAXONOMY.statusValues.map((s) => `<option value="${s}" ${s === inc.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <select id="detailSeverity" class="form-input" style="margin-bottom:.65rem">
                ${TAXONOMY.severityLevels.map((s) => `<option value="${s}" ${s === inc.severity ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-sm" id="saveStatus" style="width:100%">Save changes</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    bindDetailEvents(inc);
  } catch (err) {
    container.innerHTML = `<div class="error-state"><h3>Incident not found</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function bindDetailEvents(inc) {
  document.getElementById('backToList')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'incidents' } }));
  });

  document.getElementById('saveRca')?.addEventListener('click', async () => {
    try {
      await incidentApi.update(inc._id, { rootCause: document.getElementById('rcaInput').value });
      toast('Root cause analysis saved');
    } catch (e) { toast(e.message); }
  });

  document.getElementById('postComment')?.addEventListener('click', async () => {
    const text = document.getElementById('commentInput').value.trim();
    if (!text) return;
    try {
      await incidentApi.comment(inc._id, text);
      loadIncidentDetail(inc._id);
    } catch (e) { toast(e.message); }
  });

  document.getElementById('saveStatus')?.addEventListener('click', async () => {
    try {
      await incidentApi.update(inc._id, {
        status: document.getElementById('detailStatus').value,
        severity: document.getElementById('detailSeverity').value
      });
      toast('Incident updated');
      loadIncidentDetail(inc._id);
    } catch (e) { toast(e.message); }
  });

  document.getElementById('deleteIncident')?.addEventListener('click', async () => {
    if (!confirm('Permanently delete this incident?')) return;
    try {
      await incidentApi.delete(inc._id);
      toast('Incident deleted');
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'incidents' } }));
    } catch (e) { toast(e.message); }
  });
}

export function setupSocketHandlers() {
  window.addEventListener('incident:socket', (e) => {
    const { type } = e.detail;
    const view = document.querySelector('[data-view].active')?.dataset.view;
    if (view === 'incidents') loadIncidentList();
    if (view === 'incident-detail' && selectedId) loadIncidentDetail(selectedId);
  });
}
