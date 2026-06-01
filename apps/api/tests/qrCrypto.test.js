import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function clearApiModules() {
  Object.keys(require.cache)
    .filter((key) => key.includes('/apps/api/server/'))
    .forEach((key) => delete require.cache[key]);
}

function loadQrCrypto(key = 'test-qr-key-that-is-at-least-32-bytes') {
  process.env.QR_ENCRYPTION_KEY = key;
  clearApiModules();
  return require('../server/utils/qrCrypto');
}

afterEach(() => {
  delete process.env.QR_ENCRYPTION_KEY;
  vi.resetModules();
  clearApiModules();
});

describe('qrCrypto', () => {
  it('round-trips encrypted student payloads', () => {
    const { encryptStudentPayload, decryptQrPayload } = loadQrCrypto();
    const token = encryptStudentPayload('UNI2600001');

    expect(decryptQrPayload(token)).toBe('UNI2600001');
  });

  it('returns null for tampered QR payloads', () => {
    const { encryptStudentPayload, decryptQrPayload } = loadQrCrypto();
    const token = encryptStudentPayload('UNI2600001');
    const tampered = `${token.slice(0, -2)}aa`;

    expect(decryptQrPayload(tampered)).toBeNull();
  });

  it('returns null when decrypted with the wrong key', () => {
    const { encryptStudentPayload } = loadQrCrypto('correct-test-key-that-is-at-least-32-bytes');
    const token = encryptStudentPayload('UNI2600001');
    const { decryptQrPayload } = loadQrCrypto('wrong-test-key-that-is-at-least-32-bytes!!');

    expect(decryptQrPayload(token)).toBeNull();
  });
});
