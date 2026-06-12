const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Incident = require('./models/Incident');

dotenv.config();

const SAMPLE_INCIDENTS = [
  {
    title: 'API latency spike — checkout endpoint p99 > 2s',
    description: 'Elevated p99 latency detected on /api/v2/checkout. Error budget consumption at 78%. Auto-scaling triggered but insufficient capacity.',
    issueType: 'Performance Degradation',
    severity: 'High',
    status: 'Investigating',
    cloudProvider: 'AWS',
    affectedService: 'ELB / ALB',
    region: 'us-east-1',
    assignedTeam: 'SRE',
    assignedToPerson: 'Morgan Hayes',
    source: 'Monitoring',
    timeline: [
      { type: 'detection', message: 'CloudWatch alarm: TargetResponseTime p99 > 2000ms', author: 'CloudWatch', timestamp: new Date(Date.now() - 3600000) },
      { type: 'status', message: 'Status changed to Investigating', author: 'Morgan Hayes', timestamp: new Date(Date.now() - 3300000) },
      { type: 'comment', message: 'Scaling ASG from 12 to 24 instances. Investigating upstream dependency on payment-service.', author: 'Morgan Hayes', timestamp: new Date(Date.now() - 3000000) }
    ],
    comments: [{ text: 'PagerDuty incident #PD-8842 opened. War room bridge active.', author: 'Morgan Hayes' }]
  },
  {
    title: 'Kubernetes pod crash loop — payment-service',
    description: 'payment-service deployment payment-svc-7d4f8b9c6d experiencing CrashLoopBackOff across 3 replicas in prod cluster.',
    issueType: 'Outage',
    severity: 'Critical',
    status: 'Identified',
    cloudProvider: 'AWS',
    affectedService: 'EKS',
    region: 'us-east-1',
    assignedTeam: 'DevOps',
    assignedToPerson: 'Jamie Foster',
    source: 'Monitoring',
    rootCause: 'OOMKill — memory limit 512Mi insufficient after v2.14.0 deployment increased heap usage.',
    timeline: [
      { type: 'detection', message: 'Prometheus alert: kube_pod_container_status_restarts_total > 5', author: 'Prometheus', timestamp: new Date(Date.now() - 7200000) },
      { type: 'status', message: 'Root cause identified: OOMKill on payment-service v2.14.0', author: 'Jamie Foster', timestamp: new Date(Date.now() - 5400000) }
    ]
  },
  {
    title: 'Database connection pool exhaustion — orders-db',
    description: 'PostgreSQL connection pool at 100% utilization. New connections timing out after 30s.',
    issueType: 'Capacity Issue',
    severity: 'High',
    status: 'Monitoring',
    cloudProvider: 'AWS',
    affectedService: 'RDS',
    region: 'eu-west-1',
    assignedTeam: 'SRE',
    assignedToPerson: 'Dev Singh',
    source: 'Monitoring',
    timeline: [
      { type: 'detection', message: 'RDS DatabaseConnections metric at max capacity', author: 'CloudWatch', timestamp: new Date(Date.now() - 14400000) },
      { type: 'comment', message: 'Increased max_connections parameter. Deploying connection pooler (PgBouncer).', author: 'Dev Singh', timestamp: new Date(Date.now() - 10800000) },
      { type: 'status', message: 'Status changed to Monitoring', author: 'Dev Singh', timestamp: new Date(Date.now() - 3600000) }
    ]
  },
  {
    title: 'AWS network degradation — inter-AZ latency',
    description: 'Elevated inter-AZ network latency between us-east-1a and us-east-1b affecting cross-AZ database replication.',
    issueType: 'Network Issue',
    severity: 'Medium',
    status: 'Investigating',
    cloudProvider: 'AWS',
    affectedService: 'VPC',
    region: 'us-east-1',
    assignedTeam: 'NOC',
    assignedToPerson: 'Alex Rivera',
    source: 'CloudWebhook'
  },
  {
    title: 'Memory leak in payment service — heap growth 4MB/min',
    description: 'Continuous heap growth observed in payment-service JVM. GC pause times increasing. No OOM yet but trending.',
    issueType: 'Performance Degradation',
    severity: 'Medium',
    status: 'Identified',
    cloudProvider: 'GCP',
    affectedService: 'GKE',
    region: 'us-west-2',
    assignedTeam: 'Platform',
    assignedToPerson: 'Dana Kim',
    source: 'Monitoring',
    rootCause: 'Unclosed HTTP client connections in PaymentProcessor.java batch job.'
  },
  {
    title: 'Authentication outage — OAuth token validation failures',
    description: '40% of authentication requests failing with 503. Identity provider health check failing intermittently.',
    issueType: 'Outage',
    severity: 'Critical',
    status: 'Resolved',
    cloudProvider: 'Azure',
    affectedService: 'Active Directory',
    region: 'global',
    assignedTeam: 'Security',
    assignedToPerson: 'Victor Stein',
    source: 'Monitoring',
    resolvedAt: new Date(Date.now() - 86400000),
    detectedAt: new Date(Date.now() - 90000000),
    rootCause: 'Azure AD B2C certificate rotation not propagated to all regional replicas.',
    timeline: [
      { type: 'detection', message: 'Auth failure rate exceeded 5% threshold', author: 'Datadog', timestamp: new Date(Date.now() - 90000000) },
      { type: 'resolution', message: 'Certificate propagated. All regions healthy. Incident resolved.', author: 'Victor Stein', timestamp: new Date(Date.now() - 86400000) }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Incident.deleteMany({});
  console.log('Cleared existing incidents');

  for (const data of SAMPLE_INCIDENTS) {
    const detectedAt = data.detectedAt || new Date(Date.now() - Math.random() * 86400000 * 3);
    await Incident.create({
      ...data,
      ticketType: 'Incident',
      detectedAt,
      timeline: data.timeline || [{ type: 'detection', message: `Incident detected: ${data.title}`, author: 'System', timestamp: detectedAt }]
    });
  }

  console.log(`Seeded ${SAMPLE_INCIDENTS.length} production-style incidents`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
