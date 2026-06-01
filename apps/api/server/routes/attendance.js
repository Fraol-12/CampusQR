const express = require('express');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { processScan } = require('../services/scanService');

const router = express.Router();

router.post('/scan', authenticate, requireRoles('admin', 'teacher'), (req, res) => {
  const { qrData, course } = req.body;
  if (!qrData || !course) {
    return res.status(400).json({ error: 'QR data and course are required' });
  }

  const result = processScan(qrData, 'attendance', req.user.id, {
    skipDuplicateCheck: true,
    successMessage: 'Attendance marked',
  });

  if (!result.success) {
    req.app
      .get('io')
      ?.emit('scan:live', {
        scanType: 'attendance',
        ...result,
        timestamp: new Date().toISOString(),
      });
    return res.json(result);
  }

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 8);

  const existing = db
    .prepare(
      `
    SELECT id FROM attendance WHERE student_id = ? AND course = ? AND attendance_date = ?
  `
    )
    .get(result.student.student_id, course, today);

  if (existing) {
    result.alreadyMarked = true;
    result.message = 'Already marked present today';
    result.status = 'duplicate';
    result.display = 'warning';
  } else {
    db.prepare(
      `
      INSERT INTO attendance (student_id, course, attendance_date, attendance_time, status, marked_by)
      VALUES (?, ?, ?, ?, 'present', ?)
    `
    ).run(result.student.student_id, course, today, now, req.user.id);
    result.attendance = { course, date: today, time: now, status: 'present' };
  }

  req.app.get('io')?.emit('scan:live', {
    scanType: 'attendance',
    status: result.status,
    display: result.display,
    message: result.message,
    student: {
      studentId: result.student.student_id,
      fullName: result.student.full_name,
      photoUrl: result.student.photo_url,
    },
    timestamp: new Date().toISOString(),
  });

  res.json(result);
});

router.get('/', authenticate, requireRoles('admin', 'teacher'), (req, res) => {
  const { course, date, studentId } = req.query;
  let sql = `
    SELECT a.*, s.full_name, s.department, s.photo_url
    FROM attendance a
    JOIN students s ON a.student_id = s.student_id
    WHERE 1=1
  `;
  const params = [];

  if (course) {
    sql += ' AND a.course = ?';
    params.push(course);
  }
  if (date) {
    sql += ' AND a.attendance_date = ?';
    params.push(date);
  }
  if (studentId) {
    sql += ' AND a.student_id = ?';
    params.push(studentId);
  }
  sql += ' ORDER BY a.attendance_date DESC, a.attendance_time DESC';

  res.json(db.prepare(sql).all(...params));
});

router.get('/courses', authenticate, requireRoles('admin', 'teacher'), (_req, res) => {
  res.json(db.prepare('SELECT * FROM courses ORDER BY code').all());
});

module.exports = router;
