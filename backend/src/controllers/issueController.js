const db = require('../config/db');

// Get all issued books (filtered by role)
const getIssues = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let query = `
      SELECT ib.*, b.title as book_title, b.author as book_author, b.isbn as book_isbn, u.name as student_name, u.email as student_email
      FROM issued_books ib
      JOIN books b ON ib.book_id = b.id
      JOIN users u ON ib.student_id = u.id
    `;
    const params = [];

    // Students can only see their own issues
    if (role === 'Student') {
      query += ' WHERE ib.student_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY ib.status ASC, ib.due_date ASC, ib.issue_date DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Error retrieving issue history' });
  }
};

// Issue a book to a student
const issueBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { student_email, book_id, due_date } = req.body;

    if (!student_email || !book_id || !due_date) {
      return res.status(400).json({ message: 'Student email, Book ID, and Due Date are required.' });
    }

    // Start database transaction
    await connection.beginTransaction();

    // 1. Check if student exists and is a student
    const [userRows] = await connection.execute(
      "SELECT id, name FROM users WHERE email = ? AND role = 'Student'",
      [student_email]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Student with this email not found.' });
    }

    const studentId = userRows[0].id;

    // 2. Check if book exists and is available
    const [bookRows] = await connection.execute(
      'SELECT id, title, available_quantity FROM books WHERE id = ? FOR UPDATE',
      [book_id]
    );

    if (bookRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Book not found.' });
    }

    const book = bookRows[0];
    if (book.available_quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: `"${book.title}" is currently out of stock / unavailable.` });
    }

    // 3. Check if student already has this book issued and not returned
    const [existingIssue] = await connection.execute(
      "SELECT id FROM issued_books WHERE student_id = ? AND book_id = ? AND status = 'Issued'",
      [studentId, book_id]
    );

    if (existingIssue.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'This book is already issued to this student and not yet returned.' });
    }

    // 4. Create issue record
    await connection.execute(
      'INSERT INTO issued_books (student_id, book_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, ?)',
      [studentId, book_id, due_date, 'Issued']
    );

    // 5. Decrement available quantity of the book
    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?',
      [book_id]
    );

    // Commit transaction
    await connection.commit();
    res.status(201).json({ message: 'Book issued successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Issue book error:', error);
    res.status(500).json({ message: 'Error issuing book. Transaction rolled back.' });
  } finally {
    connection.release();
  }
};

// Return an issued book
const returnBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params; // ID of the issue record

    // Start transaction
    await connection.beginTransaction();

    // 1. Fetch the issue record
    const [issueRows] = await connection.execute(
      'SELECT * FROM issued_books WHERE id = ? FOR UPDATE',
      [id]
    );

    if (issueRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Issue record not found.' });
    }

    const issue = issueRows[0];
    if (issue.status === 'Returned') {
      await connection.rollback();
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    // 2. Mark issue record as returned
    await connection.execute(
      "UPDATE issued_books SET return_date = CURDATE(), status = 'Returned' WHERE id = ?",
      [id]
    );

    // 3. Increment book availability
    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?',
      [issue.book_id]
    );

    // Commit transaction
    await connection.commit();
    res.json({ message: 'Book returned successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Error returning book. Transaction rolled back.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getIssues,
  issueBook,
  returnBook
};
