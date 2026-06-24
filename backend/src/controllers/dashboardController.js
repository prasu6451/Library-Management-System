const db = require('../config/db');

// Get Student Dashboard statistics
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Total borrowed books currently
    const [borrowedRows] = await db.execute(
      "SELECT COUNT(*) as active_borrows FROM issued_books WHERE student_id = ? AND status = 'Issued'",
      [studentId]
    );
    const activeBorrows = borrowedRows[0].active_borrows;

    // 2. Overdue books count
    const [overdueRows] = await db.execute(
      "SELECT COUNT(*) as overdue_count FROM issued_books WHERE student_id = ? AND status = 'Issued' AND due_date < CURDATE()",
      [studentId]
    );
    const overdueCount = overdueRows[0].overdue_count;

    // 3. Total issues historically (all time)
    const [historyRows] = await db.execute(
      'SELECT COUNT(*) as history_count FROM issued_books WHERE student_id = ?',
      [studentId]
    );
    const historyCount = historyRows[0].history_count;

    // 4. Detailed list of currently issued books
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
        activeBorrows,
        overdueCount,
        historyCount
      },
      currentLoans
    });
  } catch (error) {
    console.error('Student dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving student dashboard data' });
  }
};

// Get Librarian Dashboard statistics
const getLibrarianDashboard = async (req, res) => {
  try {
    // 1. Total books in the system (sum of all quantities)
    const [totalBooksRows] = await db.execute('SELECT SUM(quantity) as total_books FROM books');
    const totalBooks = parseInt(totalBooksRows[0].total_books) || 0;

    // 2. Available books
    const [availableBooksRows] = await db.execute('SELECT SUM(available_quantity) as available_books FROM books');
    const availableBooks = parseInt(availableBooksRows[0].available_books) || 0;

    // 3. Total active issued books
    const [issuedRows] = await db.execute("SELECT COUNT(*) as issued_count FROM issued_books WHERE status = 'Issued'");
    const issuedBooks = issuedRows[0].issued_count;

    // 4. Total students in database
    const [studentsRows] = await db.execute("SELECT COUNT(*) as student_count FROM users WHERE role = 'Student'");
    const totalStudents = studentsRows[0].student_count;

    // 5. Total overdue books
    const [overdueRows] = await db.execute(
      "SELECT COUNT(*) as overdue_count FROM issued_books WHERE status = 'Issued' AND due_date < CURDATE()"
    );
    const overdueBooks = overdueRows[0].overdue_count;

    // 6. Recent activity (last 5 transaction issues/returns)
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
        totalBooks,
        availableBooks,
        issuedBooks,
        totalStudents,
        overdueBooks
      },
      recentActivity
    });
  } catch (error) {
    console.error('Librarian dashboard stats error:', error);
    res.status(500).json({ message: 'Error retrieving librarian dashboard data' });
  }
};

module.exports = {
  getStudentDashboard,
  getLibrarianDashboard
};
