const mongoose = require('mongoose');
const {
  ISSUE_TYPES, SEVERITY_LEVELS, TICKET_TYPES, TEAMS, STATUS_VALUES, REGIONS, SLA_TARGETS
} = require('../shared-taxonomy');

const timelineEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['status', 'comment', 'assignment', 'detection', 'escalation', 'resolution'], default: 'comment' },
  message: { type: String, required: true, trim: true },
  author: { type: String, default: 'System' }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Incident must contain a title'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Incident description is required'],
    trim: true,
    maxlength: 2000
  },
  rootCause: {
    type: String,
    trim: true,
    maxlength: 3000,
    default: ''
  },

  ticketType: {
    type: String,
    required: true,
    enum: TICKET_TYPES,
    default: 'Incident'
  },
  issueType: {
    type: String,
    required: true,
    enum: ISSUE_TYPES
  },
  severity: {
    type: String,
    required: true,
    enum: SEVERITY_LEVELS
  },
  status: {
    type: String,
    required: true,
    enum: STATUS_VALUES,
    default: 'Investigating'
  },

  cloudProvider: {
    type: String,
    required: true,
    enum: ['AWS', 'Azure', 'GCP', 'Other']
  },
  affectedService: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    enum: REGIONS,
    default: 'us-east-1'
  },

  assignedTeam: {
    type: String,
    enum: TEAMS,
    default: 'SRE'
  },
  assignedToPerson: {
    type: String,
    trim: true,
    default: ''
  },

  detectedAt: {
    type: Date,
    default: Date.now
  },
  slaDeadline: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },

  costImpact: { type: Number, default: 0, min: 0 },

  timeline: [timelineEntrySchema],
  comments: [commentSchema],

  source: {
    type: String,
    enum: ['Manual', 'CloudWebhook', 'Monitoring'],
    default: 'Manual'
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

incidentSchema.pre('save', async function () {
  if (!this.incidentId) {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const count = await mongoose.model('Incident').countDocuments({
      createdAt: { $gte: startOfYear }
    });
    this.incidentId = `INC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  if (!this.slaDeadline && this.severity) {
    const minutes = SLA_TARGETS[this.severity] || 480;
    this.slaDeadline = new Date(this.detectedAt.getTime() + minutes * 60 * 1000);
  }

  if (this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }

  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline = [{
      type: 'detection',
      message: `Incident detected — ${this.title}`,
      author: 'Monitoring System',
      timestamp: this.detectedAt
    }];
  }
});

incidentSchema.index({ status: 1, severity: 1, createdAt: -1 });
incidentSchema.index({ title: 'text', description: 'text', incidentId: 'text' });

module.exports = mongoose.model('Incident', incidentSchema);
