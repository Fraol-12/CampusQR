const db = require('../../database/db');
const config = require('../config');
const { decryptQrPayload } = require('../utils/qrCrypto');

function getStudentByQr(qrData) {
  const studentId = decryptQrPayload(qrData);
  if (!studentId) return { error: 'invalid_qr', message: 'Invalid or tampered QR code' };

  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);
  if (!student) return { error: 'not_found', message: 'UNAUTHORIZED PERSON', studentId };
  if (student.status !== 'active') {
    return { error: 'inactive', message: 'Student account is not active', student };
  }
  return { student };
}

function checkDuplicate(studentId, scanType) {
  const windowStart = new Date(Date.now() - config.duplicateWindowMs).toISOString();
  const recent = db
    .prepare(
      `
    SELECT id FROM scan_logs
    WHERE student_id = ? AND scan_type = ? AND status = 'valid'
    AND datetime(created_at) > datetime(?)
    ORDER BY created_at DESC LIMIT 1
  `
    )
    .get(studentId, scanType, windowStart);

  return !!recent;
}

function logScan({ studentId, scanType, status, message, scannedBy, metadata }) {
  const result = db
    .prepare(
      `
    INSERT INTO scan_logs (student_id, scan_type, status, message, scanned_by, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      studentId || null,
      scanType,
      status,
      message || null,
      scannedBy || null,
      metadata ? JSON.stringify(metadata) : null
    );
  return result.lastInsertRowid;
}

function processScan(qrData, scanType, scannedBy, options = {}) {
  const resolved = getStudentByQr(qrData);

  if (resolved.error === 'invalid_qr') {
    const logId = logScan({
      studentId: null,
      scanType,
      status: 'invalid',
      message: resolved.message,
      scannedBy,
    });
    return {
      success: false,
      status: 'invalid',
      message: 'UNAUTHORIZED PERSON',
      display: 'unauthorized',
      logId,
    };
  }

  if (resolved.error === 'not_found') {
    const logId = logScan({
      studentId: resolved.studentId,
      scanType,
      status: 'unauthorized',
      message: resolved.message,
      scannedBy,
    });
    return {
      success: false,
      status: 'unauthorized',
      message: 'UNAUTHORIZED PERSON',
      display: 'unauthorized',
      logId,
    };
  }

  if (resolved.error === 'inactive') {
    const logId = logScan({
      studentId: resolved.student.student_id,
      scanType,
      status: 'invalid',
      message: resolved.message,
      scannedBy,
    });
    return {
      success: false,
      status: 'invalid',
      message: resolved.message,
      student: resolved.student,
      display: 'unauthorized',
      logId,
    };
  }

  const { student } = resolved;

  if (!options.skipDuplicateCheck && checkDuplicate(student.student_id, scanType)) {
    const logId = logScan({
      studentId: student.student_id,
      scanType,
      status: 'duplicate',
      message: options.duplicateMessage || 'DUPLICATE SCAN DETECTED – ACCESS DENIED',
      scannedBy,
    });
    return {
      success: false,
      status: 'duplicate',
      message: options.duplicateMessage || 'DUPLICATE SCAN DETECTED – ACCESS DENIED',
      student,
      display: 'duplicate',
      logId,
    };
  }

  const logId = logScan({
    studentId: student.student_id,
    scanType,
    status: 'valid',
    message: options.successMessage || 'AUTHORIZED',
    scannedBy,
    metadata: options.metadata,
  });

  return {
    success: true,
    status: 'valid',
    message: options.successMessage || 'AUTHORIZED',
    student,
    display: 'authorized',
    logId,
  };
}

module.exports = { getStudentByQr, checkDuplicate, logScan, processScan };
