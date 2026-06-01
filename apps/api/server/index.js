const express = require('express');
const http = require('http');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const config = require('./config');
const { markOverdue } = require('./services/libraryService');

require('../database/db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const scanRoutes = require('./routes/scans');
const attendanceRoutes = require('./routes/attendance');
const libraryRoutes = require('./routes/library');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

markOverdue();

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:monitoring', () => socket.join('monitoring'));
});

// CSP disabled on localhost — upgrade-insecure-requests was blocking CSS/JS over http
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false,
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {
  if (req.path.includes('..')) return res.status(400).end();
  let filePath = req.path;
  if (filePath.endsWith('/')) filePath += 'index.html';
  const file = path.join(__dirname, '../public', filePath === '/' ? 'index.html' : filePath);
  res.sendFile(file, (err) => {
    if (err) res.sendFile(path.join(__dirname, '../public/index.html'));
  });
});

app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 5MB)' });
  }
  if (err.message === 'Only images allowed') {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only PNG, JPEG, or WebP images allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

server
  .listen(config.port, () => {
    console.log(
      `Campus QR System running at http://localhost:${config.port} ` +
        `(env=${config.nodeEnv}, duplicateWindowMs=${config.duplicateWindowMs})`
    );
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${config.port} is already in use. Stop the other process or change PORT in .env`
      );
      process.exit(1);
    }
    throw err;
  });
