const db = require('../config/db');

const getBooks = async (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM books WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [countResult] = await db.execute(countQuery, countParams);
    const totalBooks = countResult[0].total;

    const [books] = await db.execute(query, params);

    res.json({
      books,
      pagination: {
        total: totalBooks,
        page,
        limit,
        totalPages: Math.ceil(totalBooks / limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Error retrieving books list' });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({ message: 'Error retrieving book details' });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;

    if (!title || !author || !isbn || !category || quantity === undefined) {
      return res.status(400).json({ message: 'All fields are required (title, author, isbn, category, quantity)' });
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    const [isbnCheck] = await db.execute('SELECT id FROM books WHERE isbn = ?', [isbn]);
    if (isbnCheck.length > 0) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }

    const [result] = await db.execute(
      'INSERT INTO books (title, author, isbn, category, quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, parsedQuantity, parsedQuantity]
    );

    res.status(201).json({ message: 'Book created successfully', bookId: result.insertId });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Error creating book' });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, quantity } = req.body;

    if (!title || !author || !isbn || !category || quantity === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    const [bookRows] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const [isbnCheck] = await db.execute('SELECT id FROM books WHERE isbn = ? AND id != ?', [isbn, id]);
    if (isbnCheck.length > 0) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }

    const [issueCheck] = await db.execute(
      "SELECT COUNT(*) as active_count FROM issued_books WHERE book_id = ? AND status = 'Issued'",
      [id]
    );
    const activeIssues = issueCheck[0].active_count;

    if (parsedQuantity < activeIssues) {
      return res.status(400).json({
        message: `Cannot decrease quantity to ${parsedQuantity}. There are currently ${activeIssues} copies issued.`
      });
    }

    const newAvailableQuantity = parsedQuantity - activeIssues;

    await db.execute(
      'UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, quantity = ?, available_quantity = ? WHERE id = ?',
      [title, author, isbn, category, parsedQuantity, newAvailableQuantity, id]
    );

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Error updating book details' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookRows] = await db.execute('SELECT id FROM books WHERE id = ?', [id]);
    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const [issueCheck] = await db.execute(
      "SELECT COUNT(*) as active_count FROM issued_books WHERE book_id = ? AND status = 'Issued'",
      [id]
    );

    if (issueCheck[0].active_count > 0) {
      return res.status(400).json({ message: 'Cannot delete book. It is currently issued to one or more students.' });
    }

    await db.execute('DELETE FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
