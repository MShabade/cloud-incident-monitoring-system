const Incident = require('../models/Incident');
const { getIO } = require('../config/socket');
const { STATUS_VALUES, SEVERITY_LEVELS } = require('../shared-taxonomy');

function buildTimelineEntry(type, message, author) {
  return { type, message, author, timestamp: new Date() };
}

exports.createIncident = async (req, res, next) => {
  try {
    const {
      title, description, ticketType, issueType, cloudProvider, affectedService,
      severity, assignedTeam, assignedToPerson, costImpact, status, region, rootCause
    } = req.body;

    const author = req.user.username || 'Operator';

    const newIncident = new Incident({
      title,
      description,
      ticketType: ticketType || 'Incident',
      issueType,
      cloudProvider,
      affectedService,
      severity,
      assignedTeam,
      assignedToPerson,
      costImpact,
      status: status || 'Investigating',
      region,
      rootCause: rootCause || '',
      source: 'Manual',
      reportedBy: req.user.id,
      timeline: [
        buildTimelineEntry('detection', `Incident opened: ${title}`, author)
      ]
    });

    const saved = await newIncident.save();
    await saved.populate('reportedBy', 'username role');
    getIO().emit('incident:created', saved);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

exports.ingestCloudAlert = async (req, res, next) => {
  try {
    const { title, description, cloudProvider, affectedService, severity, issueType, region } = req.body;

    const newIncident = new Incident({
      title,
      description,
      ticketType: 'Incident',
      cloudProvider,
      affectedService,
      severity: severity || 'High',
      issueType: issueType || 'Outage',
      region: region || 'us-east-1',
      status: 'Investigating',
      assignedTeam: 'SRE',
      source: 'CloudWebhook',
      timeline: [buildTimelineEntry('detection', `Automated alert: ${title}`, 'CloudWatch')]
    });

    const saved = await newIncident.save();
    getIO().emit('incident:created', saved);
    res.status(201).json({ message: 'Alert ingested', incident: saved });
  } catch (error) {
    next(error);
  }
};

exports.getAllIncidents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && STATUS_VALUES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.severity && SEVERITY_LEVELS.includes(req.query.severity)) filter.severity = req.query.severity;
    if (req.query.team) filter.assignedTeam = req.query.team;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { incidentId: { $regex: req.query.search, $options: 'i' } },
        { affectedService: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('reportedBy', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Incident.countDocuments(filter)
    ]);

    res.status(200).json({
      incidents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'username role');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

exports.getMetrics = async (req, res, next) => {
  try {
    const [statusCounts, severityCounts, providerBreakdown, activeCount, resolvedIncidents] = await Promise.all([
      Incident.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Incident.aggregate([
        { $group: { _id: '$cloudProvider', count: { $sum: 1 }, totalCost: { $sum: '$costImpact' } } }
      ]),
      Incident.countDocuments({ status: { $ne: 'Resolved' } }),
      Incident.find({ status: 'Resolved', resolvedAt: { $exists: true }, detectedAt: { $exists: true } })
        .select('detectedAt resolvedAt')
        .limit(100)
    ]);

    let mttrMinutes = 0;
    if (resolvedIncidents.length) {
      const totalMs = resolvedIncidents.reduce((sum, inc) =>
        sum + (new Date(inc.resolvedAt) - new Date(inc.detectedAt)), 0);
      mttrMinutes = Math.round(totalMs / resolvedIncidents.length / 60000);
    }

    const slaBreached = await Incident.countDocuments({
      status: { $ne: 'Resolved' },
      slaDeadline: { $lt: new Date() }
    });

    res.json({
      statusCounts,
      severityCounts,
      providerBreakdown,
      activeIncidents: activeCount,
      mttrMinutes,
      slaBreached,
      availability: 99.94,
      errorRate: 0.12,
      requestsPerSec: 8420,
      slaCompliance: slaBreached === 0 ? 99.2 : Math.max(85, 99.2 - slaBreached * 2)
    });
  } catch (error) {
    next(error);
  }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status, severity, assignedTeam, assignedToPerson, rootCause, description
    } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    const author = req.user.username || 'Operator';
    const updates = { severity, assignedTeam, assignedToPerson, rootCause, description };

    if (status && status !== incident.status) {
      updates.status = status;
      incident.timeline.push(buildTimelineEntry('status', `Status changed to ${status}`, author));
      if (status === 'Resolved') updates.resolvedAt = new Date();
    }

    Object.assign(incident, updates);
    const updated = await incident.save();
    await updated.populate('reportedBy', 'username role');

    getIO().emit('incident:updated', updated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const author = req.user.username || 'Operator';
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    incident.comments.push({ text: text.trim(), author });
    incident.timeline.push(buildTimelineEntry('comment', text.trim(), author));

    const updated = await incident.save();
    await updated.populate('reportedBy', 'username role');
    getIO().emit('incident:updated', updated);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    getIO().emit('incident:deleted', { id: req.params.id });
    res.json({ message: 'Incident removed' });
  } catch (error) {
    next(error);
  }
};
