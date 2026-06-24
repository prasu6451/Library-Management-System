const express = require('express');
const router = express.Router();
const { getStudentDashboard, getLibrarianDashboard } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role-restricted dashboard access
router.get('/student', authMiddleware, roleMiddleware(['Student']), getStudentDashboard);
router.get('/librarian', authMiddleware, roleMiddleware(['Librarian']), getLibrarianDashboard);

module.exports = router;
