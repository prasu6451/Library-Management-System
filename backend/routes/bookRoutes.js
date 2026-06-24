const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getBooks);
router.get('/:id', authMiddleware, getBookById);
router.post('/', authMiddleware, roleMiddleware(['Librarian']), createBook);
router.put('/:id', authMiddleware, roleMiddleware(['Librarian']), updateBook);
router.delete('/:id', authMiddleware, roleMiddleware(['Librarian']), deleteBook);

module.exports = router;
