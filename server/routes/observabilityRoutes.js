const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/observabilityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardMetrics);

module.exports = router;
