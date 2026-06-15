const express = require('express');
const router = express.Router();
const { 
  createIncident, 
  getAllIncidents, 
  updateIncident 
} = require('../controllers/incidentController');

// Import the security middleware gatekeepers
const { protect, restrictTo } = require('../middleware/authMiddleware');

// 1. Create Incident (FR3) & Get All Incidents (FR7)
// Anyone who is logged in (protected) can view or report an incident
router.route('/')
  .post(protect, createIncident)
  .get(protect, getAllIncidents);

// 2. Update Incident Status / Assignment (FR4, FR5, FR6)
// We protect this route, and restrict it so ONLY users with the 'Administrator' role can modify incidents
router.route('/:id')
  .put(protect, restrictTo('Administrator'), updateIncident);

module.exports = router;