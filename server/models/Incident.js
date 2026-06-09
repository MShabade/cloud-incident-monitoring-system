const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  cloudService: {
    type: String,
    required: true, // e.g., 'AWS EC2', 'AWS S3', 'Nginx Reverse Proxy'
    trim: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved'],
    default: 'Open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links straight to the User collection (FR5: Incident Assignment)
    default: null
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tracks accountability and ownership
    required: true
  }
}, {
  timestamps: true // Vital data for computing MTTR (Mean Time To Resolution) operational SLAs
});

module.exports = mongoose.model('Incident', IncidentSchema);
