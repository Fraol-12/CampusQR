const db = require('../../database/db');

const FINE_PER_OVERDUE_DAY = 0.5;

function getDaysOverdue(dueDate, compareDate = new Date()) {
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  const current = new Date(compareDate.toISOString().slice(0, 10));
  const diff = current.getTime() - due.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function markOverdue() {
  return db
    .prepare(
      `
    UPDATE library_books
    SET status = 'overdue'
    WHERE status = 'borrowed' AND due_date < date('now')
  `
    )
    .run();
}

function calculateFine(dueDate) {
  return getDaysOverdue(dueDate) * FINE_PER_OVERDUE_DAY;
}

function enrichLibraryBook(book) {
  const daysOverdue = getDaysOverdue(book.due_date);
  return {
    ...book,
    daysOverdue,
    fine_amount: book.status === 'returned' ? book.fine_amount : calculateFine(book.due_date),
  };
}

function findActiveBorrow(studentId, bookName, isbn) {
  const normalizedBookName = bookName.trim().toLowerCase();
  const normalizedIsbn = isbn?.trim() || null;

  if (normalizedIsbn) {
    return db
      .prepare(
        `
      SELECT * FROM library_books
      WHERE student_id = ?
        AND status IN ('borrowed', 'overdue')
        AND (lower(book_name) = ? OR isbn = ?)
      LIMIT 1
    `
      )
      .get(studentId, normalizedBookName, normalizedIsbn);
  }

  return db
    .prepare(
      `
    SELECT * FROM library_books
    WHERE student_id = ?
      AND status IN ('borrowed', 'overdue')
      AND lower(book_name) = ?
    LIMIT 1
  `
    )
    .get(studentId, normalizedBookName);
}

module.exports = {
  FINE_PER_OVERDUE_DAY,
  calculateFine,
  enrichLibraryBook,
  findActiveBorrow,
  getDaysOverdue,
  markOverdue,
};
