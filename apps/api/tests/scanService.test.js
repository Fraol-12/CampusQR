import { beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

process.env.CAMPUS_DB_PATH = ':memory:';
process.env.QR_ENCRYPTION_KEY = 'scan-service-test-key-at-least-32-bytes';
process.env.DUPLICATE_WINDOW_MS = '300000';

const require = createRequire(import.meta.url);
const db = require('../database/db');
const { encryptStudentPayload } = require('../server/utils/qrCrypto');
const { processScan } = require('../server/services/scanService');

function clearTables() {
  db.exec('DELETE FROM cafeteria_transactions');
  db.exec('DELETE FROM library_books');
  db.exec('DELETE FROM attendance');
  db.exec('DELETE FROM scan_logs');
  db.exec('DELETE FROM students');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM courses');
}

function insertStudent(studentId, status = 'active') {
  db.prepare(
    `
    INSERT INTO students (student_id, full_name, department, batch, email, qr_payload, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    studentId,
    'Test Student',
    'Computer Science',
    '2026',
    `${studentId.toLowerCase()}@student.edu`,
    encryptStudentPayload(studentId),
    status
  );
}

beforeEach(() => {
  clearTables();
});

describe('scanService', () => {
  it('accepts a valid first scan', () => {
    insertStudent('UNI2600001');
    const token = encryptStudentPayload('UNI2600001');

    const result = processScan(token, 'entry', 1);

    expect(result.success).toBe(true);
    expect(result.status).toBe('valid');
  });

  it('blocks a duplicate scan inside the duplicate window', () => {
    insertStudent('UNI2600001');
    const token = encryptStudentPayload('UNI2600001');

    expect(processScan(token, 'entry', 1).status).toBe('valid');
    expect(processScan(token, 'entry', 1).status).toBe('duplicate');
  });

  it('rejects a QR for an unknown student', () => {
    const token = encryptStudentPayload('UNI2609999');

    const result = processScan(token, 'entry', 1);

    expect(result.success).toBe(false);
    expect(result.status).toBe('unauthorized');
  });

  it('rejects inactive students', () => {
    insertStudent('UNI2600001', 'suspended');
    const token = encryptStudentPayload('UNI2600001');

    const result = processScan(token, 'entry', 1);

    expect(result.success).toBe(false);
    expect(result.status).toBe('invalid');
  });
});
