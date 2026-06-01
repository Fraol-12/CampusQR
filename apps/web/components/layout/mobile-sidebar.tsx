'use client';

import type { Role } from '@campusqr/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUiStore } from '@/stores/ui-store';
import { Sidebar } from './sidebar';

export function MobileSidebar({ role }: { role: Role }) {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <Sidebar role={role} />
      </SheetContent>
    </Sheet>
  );
}
