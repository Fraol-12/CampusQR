'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { ROLE_ROUTES } from '@/lib/routes';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Signed in successfully');
      router.replace(ROLE_ROUTES[data.user.role]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      queryClient.clear();
      router.replace('/login');
    },
  });
}
