import {
  BookOpen,
  CalendarCheck,
  DoorOpen,
  FileBarChart,
  LayoutDashboard,
  QrCode,
  Users,
  Utensils,
} from 'lucide-react';
import type React from 'react';
import type { Role } from '@campusqr/types';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/reports', icon: FileBarChart, label: 'Reports' },
    { href: '/scanner/gate', icon: DoorOpen, label: 'Gate Scanner' },
  ],
  security: [{ href: '/scanner/gate', icon: DoorOpen, label: 'Gate Scanner' }],
  cafeteria: [{ href: '/scanner/cafeteria', icon: Utensils, label: 'Cafeteria' }],
  teacher: [
    { href: '/scanner/attendance', icon: CalendarCheck, label: 'Attendance' },
    { href: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  ],
  librarian: [{ href: '/scanner/library', icon: BookOpen, label: 'Library' }],
  student: [{ href: '/student/id-card', icon: QrCode, label: 'My ID Card' }],
};
