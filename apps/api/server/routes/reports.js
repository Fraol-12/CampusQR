const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../../database/db');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

const router = express.Router();

router.get(
  '/attendance/excel',
  authenticate,
  requireRoles('admin', 'teacher'),
  async (req, res) => {
    const { course, date } = req.query;
    let sql = `
    SELECT a.student_id, s.full_name, s.department, a.course, a.attendance_date, a.attendance_time, a.status
    FROM attendance a JOIN students s ON a.student_id = s.student_id WHERE 1=1
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
    sql += ' ORDER BY a.attendance_date DESC';

    const rows = db.prepare(sql).all(...params);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');
    sheet.columns = [
      { header: 'Student ID', key: 'student_id', width: 15 },
      { header: 'Name', key: 'full_name', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Course', key: 'course', width: 15 },
      { header: 'Date', key: 'attendance_date', width: 12 },
      { header: 'Time', key: 'attendance_time', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
    ];
    rows.forEach((r) => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }
);

router.get('/attendance/pdf', authenticate, requireRoles('admin', 'teacher'), (req, res) => {
  const { course, date } = req.query;
  let sql = `
    SELECT a.student_id, s.full_name, a.course, a.attendance_date, a.attendance_time, a.status
    FROM attendance a JOIN students s ON a.student_id = s.student_id WHERE 1=1
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
  sql += ' ORDER BY a.attendance_date DESC LIMIT 500';

  const rows = db.prepare(sql).all(...params);
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  if (course) doc.fontSize(10).text(`Course: ${course}`);
  if (date) doc.text(`Date: ${date}`);
  doc.moveDown();

  rows.forEach((r) => {
    doc
      .fontSize(9)
      .text(
        `${r.student_id} | ${r.full_name} | ${r.course} | ${r.attendance_date} ${r.attendance_time} | ${r.status}`
      );
  });
  doc.end();
});

router.get('/scans/excel', authenticate, requireRoles('admin'), async (req, res) => {
  const { date, scanType } = req.query;
  let sql = 'SELECT * FROM scan_logs WHERE 1=1';
  const params = [];
  if (date) {
    sql += ' AND date(created_at) = date(?)';
    params.push(date);
  }
  if (scanType) {
    sql += ' AND scan_type = ?';
    params.push(scanType);
  }
  sql += ' ORDER BY created_at DESC LIMIT 5000';

  const rows = db.prepare(sql).all(...params);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Scan Logs');
  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Student ID', key: 'student_id', width: 15 },
    { header: 'Type', key: 'scan_type', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Message', key: 'message', width: 30 },
    { header: 'Timestamp', key: 'created_at', width: 22 },
  ];
  rows.forEach((r) => sheet.addRow(r));

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=scan-logs.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
