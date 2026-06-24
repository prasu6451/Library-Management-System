const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/login', login);

// Protected route
router.get('/me', authMiddleware, getMe);

module.exports = router;
