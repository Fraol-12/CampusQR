'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    staleTime: 60_000,
  });
}
