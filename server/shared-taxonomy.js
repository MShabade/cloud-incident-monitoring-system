// Shared incident taxonomy — used by Mongoose schema, validators, and client

const TICKET_TYPES = ['Incident', 'Request', 'Problem'];

const ISSUE_TYPES = [
  'Outage',
  'Performance Degradation',
  'Security Alert',
  'Cost Anomaly',
  'Configuration Error',
  'Capacity Issue',
  'Network Issue',
  'Data Integrity',
  'Compliance Violation',
  'Access / IAM Issue',
  'Other'
];

const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

const STATUS_VALUES = ['Investigating', 'Identified', 'Monitoring', 'Resolved'];

const TEAMS = [
  'Unassigned',
  'NOC',
  'SOC',
  'Ops',
  'SRE',
  'DevOps',
  'Cloud Engineering',
  'Platform',
  'Security'
];

const REGIONS = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'global'
];

const CLOUD_SERVICES = {
  AWS: [
    'EC2', 'S3', 'RDS', 'Lambda', 'CloudWatch', 'ECS', 'EKS', 'VPC', 'IAM',
    'SNS', 'SQS', 'DynamoDB', 'Route 53', 'ELB / ALB', 'CloudFront'
  ],
  Azure: [
    'Virtual Machines', 'Blob Storage', 'Azure SQL', 'Functions', 'AKS',
    'Virtual Network', 'Key Vault', 'App Service', 'Cosmos DB', 'Monitor'
  ],
  GCP: [
    'Compute Engine', 'Cloud Storage', 'Cloud SQL', 'Cloud Functions', 'GKE',
    'VPC', 'Cloud IAM', 'Pub/Sub', 'BigQuery', 'Cloud Monitoring'
  ],
  Other: ['Custom Service', 'Third-party Integration', 'On-Premise Hybrid']
};

const TEAM_ASSIGNEES = {
  Unassigned: [],
  NOC: ['Alex Rivera', 'Priya Sharma', 'Marcus Lee'],
  SOC: ['Jordan Blake', 'Elena Voss', 'Chris Okonkwo'],
  Ops: ['Sam Patel', 'Riley Chen', 'Taylor Brooks'],
  SRE: ['Morgan Hayes', 'Dev Singh', 'Casey Wright'],
  DevOps: ['Jamie Foster', 'Aisha Khan', 'Noah Martinez'],
  'Cloud Engineering': ['Ravi Menon', 'Sophie Laurent', 'Ben Carter'],
  Platform: ['Dana Kim', 'Omar Hassan', 'Lily Nguyen'],
  Security: ['Victor Stein', 'Nina Petrova', 'Ethan Cole']
};

// SLA targets in minutes by severity
const SLA_TARGETS = {
  Critical: 60,
  High: 240,
  Medium: 480,
  Low: 1440
};

module.exports = {
  TICKET_TYPES,
  ISSUE_TYPES,
  SEVERITY_LEVELS,
  STATUS_VALUES,
  TEAMS,
  REGIONS,
  CLOUD_SERVICES,
  TEAM_ASSIGNEES,
  SLA_TARGETS
};
