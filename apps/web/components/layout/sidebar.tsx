'use client';

import { QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@campusqr/types';
import { cn } from '@/components/ui/utils';
import { navByRole } from './nav-items';

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role] || [];

  return (
    <aside className="flex h-full w-72 flex-col bg-primary text-primary-foreground">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <QrCode className="h-5 w-5" />
          CampusQR
        </div>
        <p className="mt-1 text-xs text-white/70">University Management System</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white',
                active && 'bg-white/10 text-white'
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
