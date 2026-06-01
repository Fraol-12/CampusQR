const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('campus_token');
}

function setToken(token) {
  if (token) localStorage.setItem('campus_token', token);
  else localStorage.removeItem('campus_token');
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const AuthAPI = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api('/auth/me'),
};

const StudentsAPI = {
  list: (params = {}) => api(`/students?${new URLSearchParams(params)}`),
  get: (id) => api(`/students/${id}`),
  me: () => api('/students/me'),
  register: (formData) => api('/students', { method: 'POST', body: formData }),
  qrImageUrl: (id) => `${API_BASE}/students/${id}/qr-image?token=${getToken()}`,
};

const ScansAPI = {
  entry: (qrData) => api('/scans/entry', { method: 'POST', body: { qrData } }),
  cafeteria: (qrData, amount) =>
    api('/scans/cafeteria', { method: 'POST', body: { qrData, amount } }),
  logs: (params = {}) => api(`/scans/logs?${new URLSearchParams(params)}`),
};

const AttendanceAPI = {
  scan: (qrData, course) => api('/attendance/scan', { method: 'POST', body: { qrData, course } }),
  list: (params = {}) => api(`/attendance?${new URLSearchParams(params)}`),
  courses: () => api('/attendance/courses'),
};

const LibraryAPI = {
  verify: (qrData) => api('/library/verify', { method: 'POST', body: { qrData } }),
  borrow: (data) => api('/library/borrow', { method: 'POST', body: data }),
  returnBook: (id) => api(`/library/return/${id}`, { method: 'POST' }),
  books: (params = {}) => api(`/library/books?${new URLSearchParams(params)}`),
};

const DashboardAPI = {
  stats: () => api('/dashboard/stats'),
};

const ReportsAPI = {
  attendanceExcel: (params) => {
    const q = new URLSearchParams(params).toString();
    window.open(`${API_BASE}/reports/attendance/excel?${q}&token=${getToken()}`, '_blank');
  },
  attendancePdf: (params) => {
    const q = new URLSearchParams(params).toString();
    window.open(`${API_BASE}/reports/attendance/pdf?${q}&token=${getToken()}`, '_blank');
  },
};

const ROLE_ROUTES = {
  admin: '/admin/dashboard.html',
  security: '/scanner/gate.html',
  cafeteria: '/scanner/cafeteria.html',
  teacher: '/scanner/attendance.html',
  librarian: '/scanner/library.html',
  student: '/student/id-card.html',
};

function redirectByRole(role) {
  window.location.href = ROLE_ROUTES[role] || '/index.html';
}

async function requireAuth(allowedRoles = null) {
  if (typeof showAppLoading === 'function') showAppLoading('Checking session...');
  try {
    const user = await AuthAPI.me();
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      redirectByRole(user.role);
      return null;
    }
    return user;
  } catch (err) {
    if (typeof showAppLoading === 'function') showAppLoading('Redirecting to login...');
    window.location.href = '/index.html';
    return null;
  }
}

function buildSidebar(activePath, user) {
  const menus = {
    admin: [
      { href: '/admin/dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
      { href: '/admin/students.html', icon: 'bi-people', label: 'Students' },
      { href: '/admin/register.html', icon: 'bi-person-plus', label: 'Register Student' },
      { href: '/admin/monitoring.html', icon: 'bi-broadcast', label: 'Live Monitoring' },
      { href: '/admin/reports.html', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
      { href: '/scanner/gate.html', icon: 'bi-door-open', label: 'Gate Scanner' },
    ],
    security: [{ href: '/scanner/gate.html', icon: 'bi-door-open', label: 'Gate Scanner' }],
    cafeteria: [{ href: '/scanner/cafeteria.html', icon: 'bi-cup-hot', label: 'Cafeteria' }],
    teacher: [
      { href: '/scanner/attendance.html', icon: 'bi-calendar-check', label: 'Attendance' },
      { href: '/admin/reports.html', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
    ],
    librarian: [{ href: '/scanner/library.html', icon: 'bi-book', label: 'Library' }],
    student: [{ href: '/student/id-card.html', icon: 'bi-person-badge', label: 'My ID Card' }],
  };

  const items = menus[user?.role] || [];
  return `
    <aside class="sidebar no-print">
      <div class="sidebar-brand">
        <h1><i class="bi bi-qr-code-scan"></i> CampusQR</h1>
        <span>University Management System</span>
      </div>
      <nav>
        ${items
          .map(
            (m) => `
          <a href="${m.href}" class="${activePath === m.href ? 'active' : ''}">
            <i class="bi ${m.icon}"></i> ${m.label}
          </a>
        `
          )
          .join('')}
        <a href="#" id="logout-btn"><i class="bi bi-box-arrow-right"></i> Logout</a>
      </nav>
    </aside>
  `;
}

function initLogout() {
  document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await AuthAPI.logout();
    } catch {
      /* ignore */
    }
    setToken(null);
    window.location.href = '/index.html';
  });
}
