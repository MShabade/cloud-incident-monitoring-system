const express = require('express');
const router = express.Router();
const { 
  createIncident, 
  getAllIncidents, 
  updateIncident,
  deleteIncident // Added delete controller link
} = require('../controllers/incidentController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

// --- 1. Root Endpoints (/api/incidents) ---
router.route('/')
  // READ: Open to everyone authenticated (Admin, User, Guest)
  .get(protect, getAllIncidents)
  // CREATE: Restricted to Admin and User only (Guest is blocked!)
  .post(protect, restrictTo('Administrator', 'User'), createIncident);

// --- 2. ID Specific Endpoints (/api/incidents/:id) ---
router.route('/:id')
  // UPDATE: Restricted to Admin and User only (Guest is blocked!)
  .put(protect, restrictTo('Administrator', 'User'), updateIncident)
  // DELETE: Strictly restricted to Administrator only (User and Guest are blocked!)
  .delete(protect, restrictTo('Administrator'), deleteIncident);

module.exports = router;