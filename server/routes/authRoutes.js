const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Map network endpoints straight to our controller logic functions
router.post('/register', register); // POST request to /api/auth/register
router.post('/login', login);       // POST request to /api/auth/login

module.exports = router;
