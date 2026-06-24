const db = require('../config/db');

const getIssues = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let query = `
      SELECT ib.*, b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             u.name as student_name, u.email as student_email
      FROM issued_books ib
      JOIN books b ON ib.book_id = b.id
      JOIN users u ON ib.student_id = u.id
    `;
    const params = [];

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

const issueBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { student_email, book_id, due_date } = req.body;

    if (!student_email || !book_id || !due_date) {
      return res.status(400).json({ message: 'Student email, Book ID, and Due Date are required.' });
    }

    await connection.beginTransaction();

    const [userRows] = await connection.execute(
      "SELECT id, name FROM users WHERE email = ? AND role = 'Student'",
      [student_email]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Student with this email not found.' });
    }

    const studentId = userRows[0].id;

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
      return res.status(400).json({ message: `"${book.title}" is currently out of stock.` });
    }

    const [existingIssue] = await connection.execute(
      "SELECT id FROM issued_books WHERE student_id = ? AND book_id = ? AND status = 'Issued'",
      [studentId, book_id]
    );

    if (existingIssue.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'This book is already issued to this student.' });
    }

    await connection.execute(
      'INSERT INTO issued_books (student_id, book_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, ?)',
      [studentId, book_id, due_date, 'Issued']
    );

    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?',
      [book_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Book issued successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Issue book error:', error);
    res.status(500).json({ message: 'Error issuing book.' });
  } finally {
    connection.release();
  }
};

const returnBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

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

    await connection.execute(
      "UPDATE issued_books SET return_date = CURDATE(), status = 'Returned' WHERE id = ?",
      [id]
    );

    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?',
      [issue.book_id]
    );

    await connection.commit();
    res.json({ message: 'Book returned successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Error returning book.' });
  } finally {
    connection.release();
  }
};

module.exports = { getIssues, issueBook, returnBook };
