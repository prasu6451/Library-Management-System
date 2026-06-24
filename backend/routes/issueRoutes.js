const express = require('express');
const router = express.Router();
const { getIssues, issueBook, returnBook } = require('../controllers/issueController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getIssues);
router.post('/', authMiddleware, roleMiddleware(['Librarian']), issueBook);
router.put('/return/:id', authMiddleware, roleMiddleware(['Librarian']), returnBook);

module.exports = router;
