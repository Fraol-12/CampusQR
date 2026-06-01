require('dotenv').config();

const DEFAULT_JWT_SECRET = 'campus-dev-secret-change-in-production';
const DEFAULT_QR_KEY = 'campus-qr-key-32chars-minimum!!';

function requireProductionSecret(name, value, defaultValue, validate) {
  if (process.env.NODE_ENV !== 'production') return;
  if (!value || value === defaultValue || !validate(value)) {
    throw new Error(`${name} must be set to a strong non-default value in production`);
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  qrEncryptionKey: process.env.QR_ENCRYPTION_KEY || DEFAULT_QR_KEY,
  duplicateWindowMs: parseInt(process.env.DUPLICATE_WINDOW_MS, 10) || 5 * 60 * 1000,
  sessionMaxAgeMs: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 8 * 60 * 60 * 1000,
};

requireProductionSecret(
  'JWT_SECRET',
  config.jwtSecret,
  DEFAULT_JWT_SECRET,
  (value) => value.length >= 32
);
requireProductionSecret(
  'QR_ENCRYPTION_KEY',
  config.qrEncryptionKey,
  DEFAULT_QR_KEY,
  (value) => Buffer.byteLength(value) >= 32
);

module.exports = config;
