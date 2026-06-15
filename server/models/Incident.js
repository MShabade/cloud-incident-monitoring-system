const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Incident must contain an analytical identifier title'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Incident trace specifications parameters are required'] 
  },
  issueType: { 
    type: String, 
    required: [true, 'Explicit categorical allocation category required'],
    enum: ['Bug', 'Outage', 'Security Alert', 'Hardware Failure'] 
  },
  cloudService: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Open', 'Hold', 'Resolved'],
    default: 'Open'
  },
  assignedTo: { 
    type: String, 
    default: 'Unassigned NOC Operator'
  }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);