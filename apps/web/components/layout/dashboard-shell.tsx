'use client';

import type React from 'react';
import type { User } from '@campusqr/types';
import { MobileSidebar } from './mobile-sidebar';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block">
        <Sidebar role={user.role} />
      </div>
      <MobileSidebar role={user.role} />
      <div className="min-w-0">
        <Topbar user={user} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
