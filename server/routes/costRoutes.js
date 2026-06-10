const express = require('express');
const router = express.Router();
const { getUtilization } = require('../controllers/costController');
const { protect } = require('../middleware/authMiddleware');

router.get('/utilization', protect, getUtilization);

module.exports = router;
