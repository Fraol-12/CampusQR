const db = require('../../database/db');

function generateStudentId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const row = db
    .prepare(
      `
    SELECT student_id FROM students
    WHERE student_id LIKE ?
    ORDER BY student_id DESC LIMIT 1
  `
    )
    .get(`UNI${year}%`);

  let seq = 1;
  if (row) {
    const num = parseInt(row.student_id.slice(-5), 10);
    if (!Number.isNaN(num)) seq = num + 1;
  }
  return `UNI${year}${String(seq).padStart(5, '0')}`;
}

module.exports = { generateStudentId };
