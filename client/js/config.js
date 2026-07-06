export const TAXONOMY = {
  severityLevels: ['Critical', 'High', 'Medium', 'Low'],
  statusValues: ['Investigating', 'Identified', 'Monitoring', 'Resolved'],
  ticketTypes: ['Incident', 'Request', 'Problem'],
  issueTypes: [
    'Outage', 'Performance Degradation', 'Security Alert', 'Cost Anomaly',
    'Configuration Error', 'Capacity Issue', 'Network Issue', 'Data Integrity',
    'Compliance Violation', 'Access / IAM Issue', 'Other'
  ],
  teams: ['NOC', 'SOC', 'Ops', 'SRE', 'DevOps', 'Cloud Engineering', 'Platform', 'Security'],
  regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1', 'global'],
  cloudProviders: ['AWS', 'Azure', 'GCP', 'Other'],
  cloudServices: {
    AWS: ['EC2', 'S3', 'RDS', 'Lambda', 'EKS', 'VPC', 'ELB / ALB', 'CloudWatch', 'DynamoDB'],
    Azure: ['Virtual Machines', 'Azure SQL', 'AKS', 'App Service', 'Key Vault', 'Active Directory'],
    GCP: ['Compute Engine', 'Cloud SQL', 'GKE', 'Cloud Functions', 'Pub/Sub', 'BigQuery'],
    Other: ['Custom Service', 'Third-party Integration']
  }
};

export function servicesForProvider(provider) {
  return TAXONOMY.cloudServices[provider] || [];
}

export function fillSelect(el, options, placeholder = 'Select...') {
  if (!el) return;
  el.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
    options.map((o) => `<option value="${o}">${o}</option>`).join('');
}
