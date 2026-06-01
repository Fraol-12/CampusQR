'use client';

import { Menu } from 'lucide-react';
import type { User } from '@campusqr/types';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import { useUiStore } from '@/stores/ui-store';

export function Topbar({ user }: { user: User }) {
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          className="lg:hidden"
          size="icon"
          variant="ghost"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <h1 className="font-semibold">{user.fullName}</h1>
        </div>
      </div>
      <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Logout
      </Button>
    </header>
  );
}
