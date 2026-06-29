const express = require('express');
const router = express.Router();
const { login, getMe, register } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authMiddleware, getMe);

module.exports = router;
