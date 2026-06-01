const crypto = require('crypto');
const config = require('../config');

function getKey() {
  return crypto.createHash('sha256').update(config.qrEncryptionKey).digest();
}

function encryptStudentPayload(studentId) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const payload = JSON.stringify({ sid: studentId, v: 1, ts: Date.now() });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

function decryptQrPayload(token) {
  try {
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(decrypted);
    if (!parsed.sid) return null;
    return parsed.sid;
  } catch {
    return null;
  }
}

module.exports = { encryptStudentPayload, decryptQrPayload };
