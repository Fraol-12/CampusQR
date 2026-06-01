const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { encryptStudentPayload } = require('../server/utils/qrCrypto');

[path.join(__dirname, '../uploads/photos'), path.join(__dirname, '../data')].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const users = [
  {
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    fullName: 'System Administrator',
  },
  {
    email: 'security@university.edu',
    password: 'security123',
    role: 'security',
    fullName: 'Gate Officer James',
  },
  {
    email: 'cafeteria@university.edu',
    password: 'cafe123',
    role: 'cafeteria',
    fullName: 'Cafeteria Staff Maria',
  },
  {
    email: 'teacher@university.edu',
    password: 'teacher123',
    role: 'teacher',
    fullName: 'Prof. Sarah Chen',
  },
  {
    email: 'librarian@university.edu',
    password: 'library123',
    role: 'librarian',
    fullName: 'Librarian David Kim',
  },
];

const courses = [
  { code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science' },
  { code: 'CS201', name: 'Data Structures', department: 'Computer Science' },
  { code: 'EE101', name: 'Circuit Analysis', department: 'Electrical Engineering' },
  { code: 'BUS301', name: 'Business Management', department: 'Business' },
];

const sampleStudents = [
  {
    fullName: 'Alex Johnson',
    department: 'Computer Science',
    batch: '2024',
    email: 'alex.j@student.edu',
    balance: 150,
  },
  {
    fullName: 'Emily Rodriguez',
    department: 'Electrical Engineering',
    batch: '2023',
    email: 'emily.r@student.edu',
    balance: 85.5,
  },
  {
    fullName: 'Michael Chen',
    department: 'Business',
    batch: '2025',
    email: 'michael.c@student.edu',
    balance: 200,
  },
  {
    fullName: 'Priya Sharma',
    department: 'Computer Science',
    batch: '2024',
    email: 'priya.s@student.edu',
    balance: 120,
  },
  {
    fullName: 'James Wilson',
    department: 'Mechanical Engineering',
    batch: '2023',
    email: null,
    balance: 50,
  },
];

function seed() {
  db.exec('DELETE FROM cafeteria_transactions');
  db.exec('DELETE FROM library_books');
  db.exec('DELETE FROM attendance');
  db.exec('DELETE FROM scan_logs');
  db.exec('DELETE FROM students');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM courses');

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, full_name) VALUES (?, ?, ?, ?)
  `);

  users.forEach((u) => {
    insertUser.run(u.email, bcrypt.hashSync(u.password, 10), u.role, u.fullName);
  });

  const insertCourse = db.prepare('INSERT INTO courses (code, name, department) VALUES (?, ?, ?)');
  courses.forEach((c) => insertCourse.run(c.code, c.name, c.department));

  const year = new Date().getFullYear().toString().slice(-2);
  const insertStudent = db.prepare(`
    INSERT INTO students (student_id, full_name, department, batch, email, photo_url, qr_payload, cafeteria_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleStudents.forEach((s, i) => {
    const studentId = `UNI${year}${String(i + 1).padStart(5, '0')}`;
    const qrPayload = encryptStudentPayload(studentId);
    insertStudent.run(
      studentId,
      s.fullName,
      s.department,
      s.batch,
      s.email,
      null,
      qrPayload,
      s.balance
    );

    if (s.email) {
      const studentRow = db.prepare('SELECT id FROM students WHERE student_id = ?').get(studentId);
      db.prepare(
        `
        INSERT INTO users (email, password_hash, role, full_name, student_ref_id)
        VALUES (?, ?, 'student', ?, ?)
      `
      ).run(s.email, bcrypt.hashSync('student123', 10), s.fullName, studentRow.id);
    }
  });

  console.log('Database seeded successfully.\n');
  console.log('Demo accounts:');
  users.forEach((u) => console.log(`  ${u.role.padEnd(10)} ${u.email} / ${u.password}`));
  console.log('  student     alex.j@student.edu / student123');
}

seed();
