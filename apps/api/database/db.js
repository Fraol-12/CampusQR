const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.CAMPUS_DB_PATH || path.join(dataDir, 'campus.db');
const sqlite = new DatabaseSync(dbPath);

sqlite.exec('PRAGMA journal_mode = WAL');
sqlite.exec('PRAGMA foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','security','cafeteria','teacher','librarian','student')),
    full_name TEXT NOT NULL,
    student_ref_id INTEGER NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    batch TEXT NOT NULL,
    email TEXT NULL,
    photo_url TEXT NULL,
    qr_payload TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','suspended','graduated')),
    cafeteria_balance REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scan_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NULL,
    scan_type TEXT NOT NULL CHECK(scan_type IN ('entry','cafeteria','library','attendance')),
    status TEXT NOT NULL CHECK(status IN ('valid','invalid','duplicate','unauthorized')),
    message TEXT NULL,
    scanned_by INTEGER NULL,
    metadata TEXT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    course TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    attendance_time TEXT NOT NULL,
    status TEXT DEFAULT 'present',
    marked_by INTEGER NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, course, attendance_date)
  );

  CREATE TABLE IF NOT EXISTS library_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    book_name TEXT NOT NULL,
    isbn TEXT NULL,
    borrow_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    return_date TEXT NULL,
    status TEXT DEFAULT 'borrowed',
    fine_amount REAL DEFAULT 0,
    processed_by INTEGER NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cafeteria_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_after REAL NOT NULL,
    processed_by INTEGER NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_scan_logs_student ON scan_logs(student_id);
  CREATE INDEX IF NOT EXISTS idx_scan_logs_type_time ON scan_logs(scan_type, created_at);
`);

/** better-sqlite3-compatible wrapper for existing route code */
const db = {
  exec(sql) {
    sqlite.exec(sql);
  },
  prepare(sql) {
    const stmt = sqlite.prepare(sql);
    return {
      get(...params) {
        return stmt.get(...params);
      },
      all(...params) {
        return stmt.all(...params);
      },
      run(...params) {
        const result = stmt.run(...params);
        return {
          changes: result.changes,
          lastInsertRowid: Number(result.lastInsertRowid),
        };
      },
    };
  },
};

module.exports = db;
