const express = require('express');
const router = express.Router();
const {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  ingestCloudAlert,
  getMetrics,
  addComment
} = require('../controllers/incidentController');

const { protect, restrictTo } = require('../middleware/authMiddleware');
const webhookAuth = require('../middleware/webhookAuth');
const { incidentRules, validate } = require('../middleware/validators');

// Cloud provider webhook — NOT behind JWT auth, behind shared-secret auth instead
router.post('/webhook', webhookAuth, ingestCloudAlert);

// Must be registered before '/:id' or Express will try to match 'metrics' as an :id
router.get('/metrics', protect, getMetrics);

router.route('/')
  .get(protect, getAllIncidents)
  .post(protect, restrictTo('Administrator', 'User'), incidentRules, validate, createIncident);

router.post('/:id/comments', protect, restrictTo('Administrator', 'User'), addComment);

router.route('/:id')
  .get(protect, getIncidentById)
  .put(protect, restrictTo('Administrator', 'User'), updateIncident)
  .delete(protect, restrictTo('Administrator'), deleteIncident);

module.exports = router;