# 🏫 CampusQR

**A smart, secure, and integrated QR-based campus management platform for universities that value efficiency, not just paperwork.**

CampusQR centralizes digital identification, secure access control, and campus services into a high-performance engine. It bridges the gap between digital credentials and physical university operations, from secure gate entry to contactless cafeteria payments.

---

## ✨ Features

### Seamless Digital Identification
- **Digital Student IDs**: Instant, secure QR-based identification for every student.
- **Physical-Digital Bridge**: Connects student profiles directly to campus infrastructure.
- **Role-Based Access**: Specialized views for security, teachers, and administration.

### Advanced Security & Validation
- **Secure QR Validation**: Uses AES-GCM encrypted QR codes to prevent forgery and screenshots.
- **Gate Entry Locking**: Automated entry/exit logging with real-time discrepancy alerts.
- **Fraud Prevention**: Hardened upload mimetypes and production-secret validation.

### Integrated Campus Life
- **Cafeteria Payments**: Contactless QR payments for meal plans and campus dining.
- **Smart Attendance**: One-tap QR scanning for classes and university events.
- **Library Flow**: Digital borrowing and returns with automated overdue tracking and duplicate-borrow guards.

### Real-time Monitoring
- **Live Feed**: Dashboard with real-time scan events via Socket.io.
- **Global Stats**: Quick-glance indicators for campus activity and service usage.
- **Mobile-First Design**: Responsive layout shell with mobile drawer and toast notifications.

---

## 🛠️ How It Works

CampusQR fetches and validates campus activity through a unified real-time architecture:

1. **Secure Generation**: The platform generates encrypted, time-sensitive QR codes for student IDs.
2. **Instant Validation**: Scanners (web/mobile) decrypt and validate QR codes via the API.
3. **Real-time Sync**: Validated events are broadcasted via **Socket.io** to monitoring dashboards.
4. **Persistent Operations**: All activity is stored in a lightweight SQLite database for immediate processing.

The **Next.js 15** frontend handles the student portal and admin dashboard, while the **Express** backend manages the core business logic and real-time messaging.

---

## 💻 Tech Stack

- **Architecture**: pnpm Workspaces + Turborepo (Monorepo)
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, TanStack Query, Zustand
- **Backend**: Express.js, Socket.io, Better-SQLite3
- **Validation & Types**: Zod (Shared across monorepo)
- **Design System**: shadcn/ui primitives

---

## 📂 Project Structure

```text
CampusQR/
├── apps/
│   ├── api/      # Express + Socket.io backend
│   └── web/      # Next.js 15 frontend (with API Proxy)
├── packages/
│   ├── config/   # Shared ESLint, Prettier, and TS configs
│   ├── types/    # Shared Zod schemas and TS types
│   └── ui/       # Shared design system components
├── docker/       # Deployment configurations
└── package.json  # Monorepo orchestration scripts
```

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/campusqr.git
   cd campusqr
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

4. **Seed the database**:
   ```bash
   pnpm run seed
   ```

### Running Locally

```bash
pnpm run dev
```

- **Student Portal & Admin**: [http://localhost:3001](http://localhost:3001)
- **Core API**: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Usage & Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | `admin123` |
| **Security** | `security@university.edu` | `security123` |
| **Cafeteria** | `cafeteria@university.edu` | `cafe123` |
| **Student** | `alex.j@student.edu` | `student123` |

---

## 🧩 Key Design Decisions

### Monorepo for Type Safety
By using a monorepo, we share **Zod** schemas between the backend and frontend. This ensures that the data being sent from the API is always perfectly typed when it reaches the UI.

### Encrypted QR Credentials
To prevent "screenshot sharing," student IDs are not just raw IDs; they are AES-GCM encrypted tokens. This keeps campus access secure and verifiable even without a constant internet connection for the scanner in some edge cases.

### SQLite for Zero-Config Deployment
We use a high-performance SQLite driver (`better-sqlite3`) to allow the platform to be spun up instantly in any environment without the overhead of a managed database service.

---

## ⚠️ Limitations

- **Horizontal Scaling**: Current SQLite architecture is optimized for single-instance high-availability. Large-scale multi-campus deployments would require the planned Drizzle + Postgres migration.
- **File Storage**: Uploads (Student photos) are currently stored in the local filesystem; S3 integration is planned for Phase 4.

---

## 🗺️ Future Improvements

- **Phase 4 Migration**: Transitioning to Drizzle ORM and PostgreSQL.
- **Accessibility**: Full WCAG compliance audit for the student portal.
- **Mobile App**: Native scanner application for specialized guard hardware.
- **Analytics**: Deep reporting engine for attendance trends and cafeteria utilization.

---

## 📄 License

This project is licensed under the MIT License.
