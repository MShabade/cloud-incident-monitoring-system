// Production-style observability metrics (simulated until external integrations)

function jitter(base, pct = 0.05) {
  const delta = base * pct * (Math.random() * 2 - 1);
  return Math.round((base + delta) * 100) / 100;
}

function timeSeries(hours, baseValue, variance = 0.15) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const t = new Date(now - (hours - 1 - i) * 3600000);
    return {
      timestamp: t.toISOString(),
      value: jitter(baseValue, variance)
    };
  });
}

exports.getDashboardMetrics = async (req, res) => {
  const range = req.query.range || '24h';
  const points = range === '7d' ? 168 : range === '30d' ? 720 : 24;

  res.json({
    updatedAt: new Date().toISOString(),
    range,
    kpis: {
      availability: jitter(99.94, 0.002),
      activeIncidents: Math.floor(jitter(4, 0.3)),
      mttrMinutes: Math.floor(jitter(47, 0.2)),
      errorRate: jitter(0.12, 0.3),
      requestsPerSec: Math.floor(jitter(8420, 0.08)),
      slaCompliance: jitter(99.2, 0.01),
      deploymentSuccessRate: jitter(98.6, 0.02)
    },
    charts: {
      incidentTrend: timeSeries(Math.min(points, 48), 3, 0.4).map((p, i) => ({
        ...p,
        value: Math.max(0, Math.floor(p.value + (i % 5 === 0 ? 2 : 0)))
      })),
      apiLatency: timeSeries(24, 142, 0.2).map((p) => ({ ...p, unit: 'ms' })),
      cpuUsage: timeSeries(24, 62, 0.15).map((p) => ({ ...p, unit: '%' })),
      memoryUsage: timeSeries(24, 71, 0.12).map((p) => ({ ...p, unit: '%' })),
      severityDistribution: [
        { severity: 'Critical', count: 1 },
        { severity: 'High', count: 3 },
        { severity: 'Medium', count: 5 },
        { severity: 'Low', count: 2 }
      ]
    },
    infrastructure: {
      regions: [
        { name: 'us-east-1', status: 'healthy', latencyMs: 12 },
        { name: 'us-west-2', status: 'healthy', latencyMs: 18 },
        { name: 'eu-west-1', status: 'degraded', latencyMs: 89 },
        { name: 'ap-southeast-1', status: 'healthy', latencyMs: 24 }
      ],
      containers: { running: 847, pending: 3, failed: 2, restarts24h: 14 },
      databases: {
        connections: { used: 342, max: 500, percent: 68 },
        replicationLagMs: 12,
        queryLatencyMs: 4.2
      },
      queues: [
        { name: 'payment-events', depth: 1240, consumers: 8, status: 'healthy' },
        { name: 'notification-dispatch', depth: 89, consumers: 4, status: 'healthy' },
        { name: 'audit-log-ingest', depth: 4520, consumers: 2, status: 'warning' }
      ],
      network: {
        throughputMbps: jitter(2840, 0.1),
        packetLoss: jitter(0.02, 0.5),
        ingressGbps: jitter(1.24, 0.08),
        egressGbps: jitter(0.89, 0.08)
      }
    },
    serviceHealth: [
      { service: 'API Gateway', status: 'operational', uptime: 99.99 },
      { service: 'Payment Service', status: 'degraded', uptime: 99.2 },
      { service: 'Auth Service', status: 'operational', uptime: 99.98 },
      { service: 'Order Processing', status: 'operational', uptime: 99.95 },
      { service: 'Notification Hub', status: 'operational', uptime: 99.97 }
    ]
  });
};
