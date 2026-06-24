/**
 * Seed Script - Run this once to fix/reset user passwords in the database.
 * Usage: node seed.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'library_management'
    });

    console.log('Connected to database.');

    const saltRounds = 10;
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log(`Generated bcrypt hash: ${hashedPassword}`);

    // Delete existing seed users if present, then re-insert with correct hash
    await connection.execute("DELETE FROM issued_books WHERE student_id IN (1, 2)");
    await connection.execute("DELETE FROM users WHERE id IN (1, 2)");

    await connection.execute(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [1, 'Main Librarian', 'librarian@library.com', hashedPassword, 'Librarian']
    );

    await connection.execute(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [2, 'Demo Student', 'student@library.com', hashedPassword, 'Student']
    );

    // Re-add sample issued book record
    await connection.execute(
      `INSERT INTO issued_books (id, student_id, book_id, issue_date, due_date, return_date, status)
       VALUES (1, 2, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 'Issued')`
    );

    // Verify bcrypt compare works
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`\nVerification test — bcrypt.compare('password123', hash): ${testMatch}`);

    console.log('\n✅ Seed complete! Users created:');
    console.log('   Librarian → librarian@library.com / password123');
    console.log('   Student   → student@library.com / password123');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
