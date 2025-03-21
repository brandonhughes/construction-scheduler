const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user profile
router.get('/me', authenticate, authController.me);

module.exports = router;
