const express = require('express');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { processScan } = require('../services/scanService');

const router = express.Router();

function emitScan(io, result, scanType) {
  if (!io) return;
  const payload = {
    scanType,
    status: result.status,
    display: result.display,
    message: result.message,
    student: result.student
      ? {
          studentId: result.student.student_id,
          fullName: result.student.full_name,
          department: result.student.department,
          photoUrl: result.student.photo_url,
        }
      : null,
    timestamp: new Date().toISOString(),
  };
  io.emit('scan:live', payload);
  io.to('monitoring').emit('scan:live', payload);
}

router.post('/entry', authenticate, requireRoles('admin', 'security'), (req, res) => {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ error: 'QR data required' });

  const result = processScan(qrData, 'entry', req.user.id, {
    duplicateMessage: 'DUPLICATE SCAN DETECTED – ACCESS DENIED',
    successMessage: 'AUTHORIZED',
  });

  emitScan(req.app.get('io'), result, 'entry');
  res.json(result);
});

router.post('/cafeteria', authenticate, requireRoles('admin', 'cafeteria'), (req, res) => {
  const { qrData, amount } = req.body;
  if (!qrData) return res.status(400).json({ error: 'QR data required' });

  const result = processScan(qrData, 'cafeteria', req.user.id, {
    duplicateMessage: 'ALREADY USED – Transaction denied',
    successMessage: 'Meal access verified',
  });

  if (result.success && amount) {
    const amt = parseFloat(amount);
    const student = db
      .prepare('SELECT cafeteria_balance FROM students WHERE student_id = ?')
      .get(result.student.student_id);
    const balanceAfter = Math.max(0, (student?.cafeteria_balance || 0) - amt);
    db.prepare(`UPDATE students SET cafeteria_balance = ? WHERE student_id = ?`).run(
      balanceAfter,
      result.student.student_id
    );
    db.prepare(
      `
      INSERT INTO cafeteria_transactions (student_id, amount, balance_after, processed_by)
      VALUES (?, ?, ?, ?)
    `
    ).run(result.student.student_id, amt, balanceAfter, req.user.id);
    result.student.cafeteria_balance = balanceAfter;
    result.transaction = { amount: amt, balanceAfter };
  } else if (result.success) {
    const student = db
      .prepare('SELECT cafeteria_balance FROM students WHERE student_id = ?')
      .get(result.student.student_id);
    result.student.cafeteria_balance = student?.cafeteria_balance ?? 0;
  }

  emitScan(req.app.get('io'), result, 'cafeteria');
  res.json(result);
});

router.get(
  '/logs',
  authenticate,
  requireRoles('admin', 'security', 'teacher', 'librarian', 'cafeteria'),
  (req, res) => {
    const { limit = 50, scanType, status, date } = req.query;
    let sql = `
    SELECT sl.*, u.full_name as scanner_name
    FROM scan_logs sl
    LEFT JOIN users u ON sl.scanned_by = u.id
    WHERE 1=1
  `;
    const params = [];

    if (scanType) {
      sql += ' AND sl.scan_type = ?';
      params.push(scanType);
    }
    if (status) {
      sql += ' AND sl.status = ?';
      params.push(status);
    }
    if (date) {
      sql += ' AND date(sl.created_at) = date(?)';
      params.push(date);
    }
    sql += ' ORDER BY sl.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10) || 50);

    const logs = db.prepare(sql).all(...params);
    res.json(logs.map((l) => ({ ...l, metadata: l.metadata ? JSON.parse(l.metadata) : null })));
  }
);

module.exports = router;
