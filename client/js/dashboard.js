import { observabilityApi, incidentApi } from './api.js';
import { escapeHtml, severityBadge, statusBadge } from './utils.js';
import { ensureChartJs } from './chart-loader.js';

let charts = {};
let refreshTimer = null;
let currentRange = '24h';

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Dashboard element #${id} not found`);
    return false;
  }
  el.innerHTML = html;
  return true;
}

function showDashboardError(message) {
  const errPanel = document.getElementById('dashboardError');
  const errMsg = document.getElementById('dashboardErrorMsg');
  document.getElementById('dashboardSkeleton')?.classList.add('hidden');
  document.getElementById('dashboardContent')?.classList.add('hidden');
  if (errMsg) errMsg.textContent = message;
  errPanel?.classList.remove('hidden');
}

function hideDashboardError() {
  document.getElementById('dashboardError')?.classList.add('hidden');
}

export function initDashboard(onNavigate) {
  document.querySelectorAll('.range-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.range-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentRange = tab.dataset.range;
      loadDashboard(true);
    });
  });

  document.getElementById('viewAllIncidents')?.addEventListener('click', () => onNavigate('incidents'));
  document.getElementById('dashboardRetry')?.addEventListener('click', () => loadDashboard(true));
  startAutoRefresh();
}

export function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    const dashboardView = document.querySelector('[data-view="dashboard"]');
    if (dashboardView && !dashboardView.classList.contains('hidden')) {
      loadDashboard(false);
    }
  }, 30000);
}

export function stopAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
}

export async function loadDashboard(showSkeleton = true) {
  const content = document.getElementById('dashboardContent');
  const skeleton = document.getElementById('dashboardSkeleton');

  if (!content || !document.getElementById('kpiGrid')) {
    showDashboardError('Dashboard layout failed to load. Please hard-refresh the page (Ctrl+Shift+R).');
    return;
  }

  hideDashboardError();

  if (showSkeleton) {
    skeleton?.classList.remove('hidden');
    content.classList.add('hidden');
  }

  try {
    await ensureChartJs();

    const [obs, metrics, incidentsRaw] = await Promise.all([
      observabilityApi.dashboard(currentRange),
      incidentApi.metrics(),
      incidentApi.list({ limit: 5, page: 1 })
    ]);

    const incidents = Array.isArray(incidentsRaw)
      ? incidentsRaw
      : (incidentsRaw.incidents || []);

    // Show content BEFORE rendering charts (Chart.js needs visible canvas)
    skeleton?.classList.add('hidden');
    content.classList.remove('hidden');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    renderKPIs(obs.kpis, metrics);
    renderCharts(obs, metrics);
    renderInfrastructure(obs.infrastructure);
    renderServiceHealth(obs.serviceHealth);
    renderRecentIncidents(incidents);

    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
      lastUpdated.textContent = `Updated ${new Date(obs.updatedAt).toLocaleTimeString()}`;
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    showDashboardError(err.message || 'Failed to load dashboard data.');
  }
}

function renderKPIs(obsKpis = {}, metrics = {}) {
  const kpis = [
    { label: 'System Availability', value: `${obsKpis.availability ?? '—'}%`, delta: '+0.02% vs yesterday', positive: true },
    { label: 'Active Incidents', value: metrics.activeIncidents ?? obsKpis.activeIncidents ?? 0, delta: metrics.activeIncidents ? `${metrics.slaBreached || 0} SLA at risk` : 'No open incidents', positive: !metrics.slaBreached },
    { label: 'MTTR', value: `${metrics.mttrMinutes || obsKpis.mttrMinutes || 0}m`, delta: 'Mean time to resolution', positive: true },
    { label: 'Error Rate', value: `${obsKpis.errorRate ?? '—'}%`, delta: 'Within SLO threshold', positive: true },
    { label: 'Requests/sec', value: (obsKpis.requestsPerSec ?? 0).toLocaleString(), delta: 'Peak: 12.4k rps', positive: true },
    { label: 'SLA Compliance', value: `${obsKpis.slaCompliance ?? '—'}%`, delta: 'Target: 99.0%', positive: (obsKpis.slaCompliance ?? 0) >= 99 }
  ];

  setHtml('kpiGrid', kpis.map((k) => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-delta ${k.positive ? 'positive' : 'negative'}">${k.delta}</div>
    </div>
  `).join(''));
}

function destroyCharts() {
  Object.values(charts).forEach((c) => { try { c?.destroy(); } catch { /* ignore */ } });
  charts = {};
}

function showChartFallback(message) {
  ['chartTrend', 'chartSeverity', 'chartLatency', 'chartResources'].forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas.style.display = 'none';
    let msg = canvas.parentElement.querySelector('.chart-fallback-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'chart-fallback-msg';
      msg.style.cssText = 'color:var(--text-muted);font-size:.8rem;padding:2rem 0;text-align:center';
      canvas.parentElement.appendChild(msg);
    }
    msg.textContent = message;
  });
}

function clearChartFallback() {
  ['chartTrend', 'chartSeverity', 'chartLatency', 'chartResources'].forEach((id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas.style.display = '';
    canvas.parentElement.querySelector('.chart-fallback-msg')?.remove();
  });
}

function renderCharts(obs, metrics) {
  const ChartLib = window.Chart;
  if (!ChartLib) {
    showChartFallback('Charts unavailable — run: cd server && npm run vendor');
    return;
  }

  clearChartFallback();
  destroyCharts();
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748b';
  const gridColor = 'rgba(128,128,128,0.08)';

  const trend = obs.charts?.incidentTrend || [];
  const trendLabels = trend.map((p) =>
    new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
  const trendData = trend.map((p) => p.value);

  const trendCanvas = document.getElementById('chartTrend');
  if (trendCanvas) {
    charts.trend = new ChartLib(trendCanvas, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Incidents',
          data: trendData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: chartOpts(textColor, gridColor)
    });
  }

  const sevLabels = ['Critical', 'High', 'Medium', 'Low'];
  const sevData = sevLabels.map((s) => {
    const fromDb = metrics.severityCounts?.find((x) => x._id === s);
    const fromObs = (obs.charts?.severityDistribution || []).find((x) => x.severity === s);
    return fromDb?.count ?? fromObs?.count ?? 0;
  });

  const sevCanvas = document.getElementById('chartSeverity');
  if (sevCanvas) {
    charts.severity = new ChartLib(sevCanvas, {
      type: 'doughnut',
      data: {
        labels: sevLabels,
        datasets: [{ data: sevData, backgroundColor: ['#dc2626', '#f97316', '#eab308', '#22c55e'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 10, font: { size: 10 } } } } }
    });
  }

  const latency = obs.charts?.apiLatency || [];
  const latencyCanvas = document.getElementById('chartLatency');
  if (latencyCanvas) {
    charts.latency = new ChartLib(latencyCanvas, {
      type: 'line',
      data: {
        labels: latency.map((p) => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit' })),
        datasets: [{
          label: 'p99 latency (ms)',
          data: latency.map((p) => p.value),
          borderColor: '#a855f7',
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: chartOpts(textColor, gridColor)
    });
  }

  const cpu = obs.charts?.cpuUsage || [];
  const mem = obs.charts?.memoryUsage || [];
  const resCanvas = document.getElementById('chartResources');
  if (resCanvas) {
    charts.resources = new ChartLib(resCanvas, {
      type: 'line',
      data: {
        labels: cpu.map((p) => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit' })),
        datasets: [
          { label: 'CPU %', data: cpu.map((p) => p.value), borderColor: '#3b82f6', tension: 0.35, pointRadius: 0, borderWidth: 2 },
          { label: 'Memory %', data: mem.map((p) => p.value), borderColor: '#f59e0b', tension: 0.35, pointRadius: 0, borderWidth: 2 }
        ]
      },
      options: { ...chartOpts(textColor, gridColor), plugins: { legend: { labels: { color: textColor, boxWidth: 10, font: { size: 10 } } } } }
    });
  }
}

function chartOpts(textColor, gridColor) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: textColor, maxTicksLimit: 8, font: { size: 10 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor }, beginAtZero: true }
    }
  };
}

function renderInfrastructure(infra = {}) {
  setHtml('regionHealth', (infra.regions || []).map((r) => `
    <div class="infra-row">
      <span><span class="status-dot ${r.status === 'healthy' ? 'healthy' : 'degraded'}"></span>${escapeHtml(r.name)}</span>
      <span style="color:var(--text-muted)">${r.latencyMs}ms</span>
    </div>
  `).join(''));

  const c = infra.containers || { running: 0, pending: 0, failed: 0, restarts24h: 0 };
  setHtml('containerStats', `
    <div class="infra-row"><span>Running</span><strong>${c.running}</strong></div>
    <div class="infra-row"><span>Pending</span><strong>${c.pending}</strong></div>
    <div class="infra-row"><span>Failed</span><strong style="color:var(--danger)">${c.failed}</strong></div>
    <div class="infra-row"><span>Restarts (24h)</span><strong>${c.restarts24h}</strong></div>
  `);

  const db = infra.databases || { connections: { used: 0, max: 500, percent: 0 }, replicationLagMs: 0, queryLatencyMs: 0 };
  const pct = db.connections.percent || 0;
  setHtml('dbStats', `
    <div class="infra-row"><span>Connections</span><span>${db.connections.used}/${db.connections.max}</span></div>
    <div class="progress-bar"><div class="progress-fill ${pct > 80 ? 'warning' : ''}" style="width:${pct}%"></div></div>
    <div class="infra-row" style="margin-top:.5rem"><span>Replication lag</span><span>${db.replicationLagMs}ms</span></div>
    <div class="infra-row"><span>Query latency</span><span>${db.queryLatencyMs}ms</span></div>
  `);

  setHtml('queueStats', (infra.queues || []).map((q) => `
    <div class="infra-row">
      <div>
        <div>${escapeHtml(q.name)}</div>
        <div style="font-size:.7rem;color:var(--text-muted)">${q.consumers} consumers · depth ${q.depth.toLocaleString()}</div>
      </div>
      <span class="status-dot ${q.status === 'healthy' ? 'healthy' : 'degraded'}"></span>
    </div>
  `).join(''));

  const net = infra.network || { throughputMbps: 0, packetLoss: 0, ingressGbps: 0, egressGbps: 0 };
  setHtml('networkStats', `
    <div class="infra-row"><span>Throughput</span><strong>${net.throughputMbps} Mbps</strong></div>
    <div class="infra-row"><span>Packet loss</span><span>${net.packetLoss}%</span></div>
    <div class="infra-row"><span>Ingress</span><span>${net.ingressGbps} Gbps</span></div>
    <div class="infra-row"><span>Egress</span><span>${net.egressGbps} Gbps</span></div>
  `);
}

function renderServiceHealth(services = []) {
  setHtml('serviceHealth', services.map((s) => `
    <div class="infra-row">
      <span>${escapeHtml(s.service)}</span>
      <span>
        <span class="status-dot ${s.status === 'operational' ? 'healthy' : 'degraded'}"></span>
        ${s.uptime}% uptime
      </span>
    </div>
  `).join(''));
}

function renderRecentIncidents(incidents) {
  const el = document.getElementById('recentIncidents');
  if (!el) return;

  if (!incidents.length) {
    el.innerHTML = '<div class="empty-state"><p>No active incidents</p></div>';
    return;
  }

  el.innerHTML = `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Service</th></tr></thead>
    <tbody>${incidents.map((i) => `
      <tr data-id="${i._id}">
        <td><span class="incident-id">${escapeHtml(i.incidentId || '—')}</span></td>
        <td>${escapeHtml(i.title)}</td>
        <td>${severityBadge(i.severity)}</td>
        <td>${statusBadge(i.status)}</td>
        <td>${escapeHtml(i.affectedService)}</td>
      </tr>
    `).join('')}</tbody>
  </table></div>`;

  el.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'incident-detail', id: row.dataset.id } }));
    });
  });
}

export function destroyDashboard() {
  stopAutoRefresh();
  destroyCharts();
}
