const express = require('express');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { processScan } = require('../services/scanService');
const {
  calculateFine,
  enrichLibraryBook,
  findActiveBorrow,
  markOverdue,
} = require('../services/libraryService');

const router = express.Router();

router.post('/verify', authenticate, requireRoles('admin', 'librarian'), (req, res) => {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ error: 'QR data required' });

  markOverdue();

  const result = processScan(qrData, 'library', req.user.id, {
    skipDuplicateCheck: true,
    successMessage: 'Identity verified',
  });

  if (result.success) {
    const borrowed = db
      .prepare(
        `
      SELECT * FROM library_books
      WHERE student_id = ? AND status IN ('borrowed', 'overdue')
      ORDER BY due_date
    `
      )
      .all(result.student.student_id);
    result.borrowedBooks = borrowed.map(enrichLibraryBook);
  }

  res.json(result);
});

router.post('/borrow', authenticate, requireRoles('admin', 'librarian'), (req, res) => {
  const { studentId, bookName, isbn, dueDays = 14 } = req.body;
  if (!studentId || !bookName) {
    return res.status(400).json({ error: 'Student ID and book name required' });
  }

  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  markOverdue();

  const duplicateBorrow = findActiveBorrow(studentId, bookName, isbn);
  if (duplicateBorrow) {
    return res.status(409).json({
      error: 'Student already has an active borrow for this book',
      book: enrichLibraryBook(duplicateBorrow),
    });
  }

  const borrowDate = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + parseInt(dueDays, 10));
  const dueDate = due.toISOString().slice(0, 10);

  const r = db
    .prepare(
      `
    INSERT INTO library_books (student_id, book_name, isbn, borrow_date, due_date, processed_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(studentId, bookName, isbn || null, borrowDate, dueDate, req.user.id);

  db.prepare(
    `
    INSERT INTO scan_logs (student_id, scan_type, status, message, scanned_by, metadata)
    VALUES (?, 'library', 'valid', ?, ?, ?)
  `
  ).run(
    studentId,
    `Borrowed: ${bookName}`,
    req.user.id,
    JSON.stringify({ bookId: r.lastInsertRowid })
  );

  res.status(201).json({ id: r.lastInsertRowid, borrowDate, dueDate });
});

router.post('/return/:bookId', authenticate, requireRoles('admin', 'librarian'), (req, res) => {
  const book = db.prepare('SELECT * FROM library_books WHERE id = ?').get(req.params.bookId);
  if (!book) return res.status(404).json({ error: 'Book record not found' });
  if (book.status === 'returned') return res.status(400).json({ error: 'Already returned' });

  const returnDate = new Date().toISOString().slice(0, 10);
  const fine = calculateFine(book.due_date);

  db.prepare(
    `
    UPDATE library_books SET return_date = ?, status = 'returned', fine_amount = ? WHERE id = ?
  `
  ).run(returnDate, fine, book.id);

  res.json({ returnDate, fine });
});

router.get('/books', authenticate, requireRoles('admin', 'librarian'), (req, res) => {
  const { status, studentId } = req.query;
  let sql = `
    SELECT lb.*, s.full_name, s.department
    FROM library_books lb
    JOIN students s ON lb.student_id = s.student_id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += ' AND lb.status = ?';
    params.push(status);
  }
  if (studentId) {
    sql += ' AND lb.student_id = ?';
    params.push(studentId);
  }
  sql += ' ORDER BY lb.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

module.exports = router;
