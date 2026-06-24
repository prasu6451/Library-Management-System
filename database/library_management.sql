-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `library_management`;
USE `library_management`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('Student', 'Librarian') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `books`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `isbn` VARCHAR(50) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `available_quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `issued_books`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `issued_books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `status` ENUM('Issued', 'Returned') NOT NULL DEFAULT 'Issued',
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Indexes for performance optimization
-- --------------------------------------------------------
CREATE INDEX idx_user_email ON `users`(`email`);
CREATE INDEX idx_book_isbn ON `books`(`isbn`);
CREATE INDEX idx_book_category ON `books`(`category`);
CREATE INDEX idx_issued_status ON `issued_books`(`status`);

-- --------------------------------------------------------
-- Seed Data
-- --------------------------------------------------------

-- Insert Default Users (password is 'password123' for both, hashed using bcrypt)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Main Librarian', 'librarian@library.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Librarian'),
(2, 'Demo Student', 'student@library.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Student');

-- Insert Initial Sample Books
INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `category`, `quantity`, `available_quantity`) VALUES
(1, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 5, 5),
(2, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Computer Science', 3, 3),
(3, 'To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'Fiction', 4, 4),
(4, 'A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'Science', 2, 2),
(5, 'The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'Fiction', 6, 6),
(6, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma', '978-0201633610', 'Computer Science', 3, 3);

-- Insert Sample Issued Books (Demo Student borrows "Clean Code")
INSERT INTO `issued_books` (`id`, `student_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status`) VALUES
(1, 2, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 'Issued');

-- Update available quantity for Clean Code since 1 is issued to student 2
UPDATE `books` SET `available_quantity` = 2 WHERE `id` = 2;
