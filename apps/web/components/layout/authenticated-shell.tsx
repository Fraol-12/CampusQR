'use client';

import type React from 'react';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DashboardShell } from './dashboard-shell';

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();

  if (user.isLoading) return <LoadingState message="Checking session..." />;
  if (user.isError || !user.data) return <ErrorState message="Could not load your session." />;

  return <DashboardShell user={user.data}>{children}</DashboardShell>;
}
