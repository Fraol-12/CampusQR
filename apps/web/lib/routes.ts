import type { Role } from '@campusqr/types';

export const ROLE_ROUTES: Record<Role, string> = {
  admin: '/admin/dashboard',
  security: '/scanner/gate',
  cafeteria: '/scanner/cafeteria',
  teacher: '/scanner/attendance',
  librarian: '/scanner/library',
  student: '/student/id-card',
};

export const ROUTE_ROLES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/scanner/gate', roles: ['admin', 'security'] },
  { prefix: '/scanner/cafeteria', roles: ['admin', 'cafeteria'] },
  { prefix: '/scanner/attendance', roles: ['admin', 'teacher'] },
  { prefix: '/scanner/library', roles: ['admin', 'librarian'] },
  { prefix: '/student', roles: ['admin', 'student'] },
];
