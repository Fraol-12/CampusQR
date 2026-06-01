-- MySQL-compatible schema (SQLite variant applied in db.js)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','security','cafeteria','teacher','librarian','student') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  student_ref_id INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL,
  batch VARCHAR(32) NOT NULL,
  email VARCHAR(255) NULL,
  photo_url VARCHAR(512) NULL,
  qr_payload TEXT NOT NULL,
  status ENUM('active','suspended','graduated') DEFAULT 'active',
  cafeteria_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NULL,
  scan_type ENUM('entry','cafeteria','library','attendance') NOT NULL,
  status ENUM('valid','invalid','duplicate','unauthorized') NOT NULL,
  message VARCHAR(512) NULL,
  scanned_by INTEGER NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scan_student (student_id),
  INDEX idx_scan_type_time (scan_type, created_at)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL,
  course VARCHAR(128) NOT NULL,
  attendance_date DATE NOT NULL,
  attendance_time TIME NOT NULL,
  status ENUM('present','absent','late') DEFAULT 'present',
  marked_by INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_attendance (student_id, course, attendance_date)
);

CREATE TABLE IF NOT EXISTS library_books (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL,
  book_name VARCHAR(255) NOT NULL,
  isbn VARCHAR(32) NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('borrowed','returned','overdue') DEFAULT 'borrowed',
  fine_amount DECIMAL(10,2) DEFAULT 0.00,
  processed_by INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cafeteria_transactions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  processed_by INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL
);
