const express = require('express');
const router = express.Router();
const { getIssues, issueBook, returnBook } = require('../controllers/issueController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get issues list (Accessible by Student and Librarian, details filtered inside controller)
router.get('/', authMiddleware, getIssues);

// Librarian only routes
router.post('/', authMiddleware, roleMiddleware(['Librarian']), issueBook);
router.put('/return/:id', authMiddleware, roleMiddleware(['Librarian']), returnBook);

module.exports = router;
