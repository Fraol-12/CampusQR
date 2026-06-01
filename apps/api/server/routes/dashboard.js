const express = require('express');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

const router = express.Router();

router.get(
  '/stats',
  authenticate,
  requireRoles('admin', 'security', 'teacher', 'librarian', 'cafeteria'),
  (_req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    const totalStudents = db
      .prepare("SELECT COUNT(*) as c FROM students WHERE status = 'active'")
      .get().c;
    const todayEntries = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM scan_logs
    WHERE scan_type = 'entry' AND status = 'valid' AND date(created_at) = date(?)
  `
      )
      .get(today).c;
    const invalidScans = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM scan_logs
    WHERE status IN ('invalid','unauthorized','duplicate') AND date(created_at) = date(?)
  `
      )
      .get(today).c;
    const cafeteriaToday = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM scan_logs
    WHERE scan_type = 'cafeteria' AND status = 'valid' AND date(created_at) = date(?)
  `
      )
      .get(today).c;
    const attendanceToday = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM attendance WHERE attendance_date = ?
  `
      )
      .get(today).c;
    const libraryActive = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM library_books WHERE status IN ('borrowed','overdue')
  `
      )
      .get().c;
    const duplicateToday = db
      .prepare(
        `
    SELECT COUNT(*) as c FROM scan_logs
    WHERE status = 'duplicate' AND date(created_at) = date(?)
  `
      )
      .get(today).c;

    const hourlyEntries = db
      .prepare(
        `
    SELECT strftime('%H', created_at) as hour, COUNT(*) as count
    FROM scan_logs
    WHERE scan_type = 'entry' AND status = 'valid' AND date(created_at) = date(?)
    GROUP BY hour ORDER BY hour
  `
      )
      .all(today);

    const recentScans = db
      .prepare(
        `
    SELECT sl.*, s.full_name, s.photo_url, s.department
    FROM scan_logs sl
    LEFT JOIN students s ON sl.student_id = s.student_id
    ORDER BY sl.created_at DESC LIMIT 20
  `
      )
      .all();

    const scanBreakdown = db
      .prepare(
        `
    SELECT scan_type, status, COUNT(*) as count
    FROM scan_logs WHERE date(created_at) = date(?)
    GROUP BY scan_type, status
  `
      )
      .all(today);

    res.json({
      totalStudents,
      todayEntries,
      invalidScans,
      cafeteriaToday,
      attendanceToday,
      libraryActive,
      duplicateToday,
      hourlyEntries,
      recentScans: recentScans.map((s) => ({
        ...s,
        metadata: s.metadata ? JSON.parse(s.metadata) : null,
      })),
      scanBreakdown,
    });
  }
);

module.exports = router;
