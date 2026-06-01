# CampusQR — Smart QR Campus Management System

Enterprise-style web application for university campus operations: digital student IDs, encrypted QR codes, gate entry, cafeteria, attendance, and library management.

## Features

- **Student registration** with auto-generated ID, encrypted QR, and digital ID card (print/download)
- **Campus entry scanner** with green/red authorization feedback and duplicate detection
- **Cafeteria scanner** with balance tracking and anti-fraud duplicate blocking
- **Attendance scanner** with course-based tracking and Excel/PDF export
- **Library system** for borrow/return with overdue fines
- **Admin dashboard** with live stats and real-time scan monitoring (Socket.io)
- **RBAC** — Admin, Security, Cafeteria, Teacher, Librarian, Student roles
- **AES-256-GCM encrypted QR payloads** (not plain-text student IDs)
- **Sound alerts** for scan success, warning, and failure

## Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | HTML5, CSS3, ES6+, Bootstrap Icons, Html5-Qrcode       |
| Backend   | Node.js, Express                                       |
| Database  | SQLite (demo) + MySQL-compatible `database/schema.sql` |
| Real-time | Socket.io                                              |
| Auth      | JWT + HTTP-only cookies                                |

## Quick Start

```bash
npm install
npm run seed
npm start
```

Open **http://localhost:3000**

### Demo Accounts

| Role      | Email                    | Password    |
| --------- | ------------------------ | ----------- |
| Admin     | admin@university.edu     | admin123    |
| Security  | security@university.edu  | security123 |
| Cafeteria | cafeteria@university.edu | cafe123     |
| Teacher   | teacher@university.edu   | teacher123  |
| Librarian | librarian@university.edu | library123  |
| Student   | alex.j@student.edu       | student123  |

## Configuration

Copy `.env.example` to `.env`:

```env
PORT=3000
JWT_SECRET=your-long-random-secret
QR_ENCRYPTION_KEY=32-character-minimum-secret-key!!
DUPLICATE_WINDOW_MS=300000
```

`DUPLICATE_WINDOW_MS` controls the anti-duplicate scan window (default: 5 minutes).

## Project Structure

```
├── database/          # Schema, SQLite init, seed script
├── server/            # Express API, routes, services
├── public/            # Frontend pages and assets
│   ├── admin/         # Dashboard, students, monitoring, reports
│   ├── scanner/       # Gate, cafeteria, attendance, library
│   └── student/       # Digital ID card view
└── uploads/           # Student photos
```

## API Overview

| Endpoint                    | Description                    |
| --------------------------- | ------------------------------ |
| `POST /api/auth/login`      | Authenticate                   |
| `GET /api/students`         | List students (admin)          |
| `POST /api/students`        | Register student + generate QR |
| `POST /api/scans/entry`     | Gate scan validation           |
| `POST /api/scans/cafeteria` | Cafeteria scan                 |
| `POST /api/attendance/scan` | Mark attendance                |
| `POST /api/library/verify`  | Library identity check         |
| `GET /api/dashboard/stats`  | Dashboard analytics            |

## Security Notes

- Change `JWT_SECRET` and `QR_ENCRYPTION_KEY` before production
- QR codes contain AES-256-GCM encrypted payloads; rotating the key invalidates existing cards
- Use HTTPS in production; set `NODE_ENV=production` for secure cookies
- Camera access requires HTTPS or localhost

## MySQL Migration

Use `database/schema.sql` with MySQL 8+. Point the app to MySQL by replacing `database/db.js` with a `mysql2` connection pool implementation.

## License

MIT
