const db = require('../config/db');

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [borrowedRows] = await db.execute(
      "SELECT COUNT(*) as active_borrows FROM issued_books WHERE student_id = ? AND status = 'Issued'",
      [studentId]
    );

    const [overdueRows] = await db.execute(
      "SELECT COUNT(*) as overdue_count FROM issued_books WHERE student_id = ? AND status = 'Issued' AND due_date < CURDATE()",
      [studentId]
    );

    const [historyRows] = await db.execute(
      'SELECT COUNT(*) as history_count FROM issued_books WHERE student_id = ?',
      [studentId]
    );

    const [currentLoans] = await db.execute(
      `SELECT ib.id, ib.issue_date, ib.due_date, b.title, b.author, b.isbn, b.category,
              DATEDIFF(ib.due_date, CURDATE()) as days_left
       FROM issued_books ib
       JOIN books b ON ib.book_id = b.id
       WHERE ib.student_id = ? AND ib.status = 'Issued'
       ORDER BY ib.due_date ASC`,
      [studentId]
    );

    res.json({
      stats: {
        activeBorrows: borrowedRows[0].active_borrows,
        overdueCount: overdueRows[0].overdue_count,
        historyCount: historyRows[0].history_count
      },
      currentLoans
    });
  } catch (error) {
    console.error('Student dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving student dashboard data' });
  }
};

const getLibrarianDashboard = async (req, res) => {
  try {
    const [totalBooksRows] = await db.execute('SELECT SUM(quantity) as total_books FROM books');
    const [availableBooksRows] = await db.execute('SELECT SUM(available_quantity) as available_books FROM books');
    const [issuedRows] = await db.execute("SELECT COUNT(*) as issued_count FROM issued_books WHERE status = 'Issued'");
    const [studentsRows] = await db.execute("SELECT COUNT(*) as student_count FROM users WHERE role = 'Student'");
    const [overdueRows] = await db.execute(
      "SELECT COUNT(*) as overdue_count FROM issued_books WHERE status = 'Issued' AND due_date < CURDATE()"
    );

    const [recentActivity] = await db.execute(
      `SELECT ib.id, ib.status, ib.issue_date, ib.return_date, ib.due_date,
              b.title as book_title, u.name as student_name
       FROM issued_books ib
       JOIN books b ON ib.book_id = b.id
       JOIN users u ON ib.student_id = u.id
       ORDER BY COALESCE(ib.return_date, ib.issue_date) DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        totalBooks: parseInt(totalBooksRows[0].total_books) || 0,
        availableBooks: parseInt(availableBooksRows[0].available_books) || 0,
        issuedBooks: issuedRows[0].issued_count,
        totalStudents: studentsRows[0].student_count,
        overdueBooks: overdueRows[0].overdue_count
      },
      recentActivity
    });
  } catch (error) {
    console.error('Librarian dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving librarian dashboard data' });
  }
};

module.exports = { getStudentDashboard, getLibrarianDashboard };
