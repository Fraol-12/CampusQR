const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const QRCode = require('qrcode');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { generateStudentId } = require('../utils/studentIdGen');
const { encryptStudentPayload } = require('../utils/qrCrypto');
const bcrypt = require('bcryptjs');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, or WebP images allowed'));
    }
    cb(null, true);
  },
});

router.get(
  '/',
  authenticate,
  requireRoles('admin', 'teacher', 'librarian', 'security', 'cafeteria'),
  (req, res) => {
    const { search, department, status } = req.query;
    let sql =
      'SELECT id, student_id, full_name, department, batch, email, photo_url, status, cafeteria_balance, created_at FROM students WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (full_name LIKE ? OR student_id LIKE ? OR email LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const students = db.prepare(sql).all(...params);
    res.json(students);
  }
);

router.get('/me', authenticate, requireRoles('student'), (req, res) => {
  const user = db.prepare('SELECT student_ref_id FROM users WHERE id = ?').get(req.user.id);
  if (!user?.student_ref_id) return res.status(404).json({ error: 'No student profile linked' });
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(user.student_ref_id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.get('/:studentId/qr-image', authenticate, async (req, res) => {
  const student = db
    .prepare('SELECT student_id, qr_payload FROM students WHERE student_id = ?')
    .get(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Not found' });

  if (req.user.role === 'student') {
    const user = db.prepare('SELECT student_ref_id FROM users WHERE id = ?').get(req.user.id);
    const own = db
      .prepare('SELECT student_id FROM students WHERE id = ?')
      .get(user?.student_ref_id);
    if (own?.student_id !== student.student_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  const png = await QRCode.toBuffer(student.qr_payload, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
  res.type('png').send(png);
});

router.get('/:studentId', authenticate, (req, res) => {
  const student = db
    .prepare('SELECT * FROM students WHERE student_id = ?')
    .get(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (req.user.role === 'student') {
    const user = db.prepare('SELECT student_ref_id FROM users WHERE id = ?').get(req.user.id);
    const own = db
      .prepare('SELECT student_id FROM students WHERE id = ?')
      .get(user?.student_ref_id);
    if (own?.student_id !== student.student_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  res.json(student);
});

router.post('/', authenticate, requireRoles('admin'), upload.single('photo'), async (req, res) => {
  try {
    const { fullName, department, batch, email, password, cafeteriaBalance } = req.body;
    if (!fullName || !department || !batch) {
      return res.status(400).json({ error: 'Full name, department, and batch are required' });
    }

    const studentId = generateStudentId();
    const qrPayload = encryptStudentPayload(studentId);
    const photoUrl = req.file ? `/uploads/photos/${req.file.filename}` : null;
    const balance = parseFloat(cafeteriaBalance) || 0;

    const insert = db
      .prepare(
        `
      INSERT INTO students (student_id, full_name, department, batch, email, photo_url, qr_payload, cafeteria_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        studentId,
        fullName.trim(),
        department.trim(),
        batch.trim(),
        email?.trim() || null,
        photoUrl,
        qrPayload,
        balance
      );

    if (email && password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare(
        `
        INSERT INTO users (email, password_hash, role, full_name, student_ref_id)
        VALUES (?, ?, 'student', ?, ?)
      `
      ).run(email.toLowerCase().trim(), hash, fullName.trim(), insert.lastInsertRowid);
    }

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(insert.lastInsertRowid);
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    req.app.get('io')?.emit('student:registered', { student });

    res.status(201).json({ student, qrDataUrl });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Student ID or email already exists' });
    }
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.patch('/:studentId/status', authenticate, requireRoles('admin'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended', 'graduated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const result = db
    .prepare(
      `
    UPDATE students SET status = ?, updated_at = datetime('now') WHERE student_id = ?
  `
    )
    .run(status, req.params.studentId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

router.patch(
  '/:studentId/balance',
  authenticate,
  requireRoles('admin', 'cafeteria'),
  (req, res) => {
    const { amount, operation } = req.body;
    const student = db
      .prepare('SELECT * FROM students WHERE student_id = ?')
      .get(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Not found' });

    let newBalance = student.cafeteria_balance;
    if (operation === 'set') newBalance = parseFloat(amount);
    else if (operation === 'add') newBalance += parseFloat(amount);
    else return res.status(400).json({ error: 'Invalid operation' });

    db.prepare(
      `UPDATE students SET cafeteria_balance = ?, updated_at = datetime('now') WHERE student_id = ?`
    ).run(newBalance, req.params.studentId);

    res.json({ balance: newBalance });
  }
);

module.exports = router;
