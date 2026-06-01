'use client';

import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export function getQueryClient() {
  client ??= new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
  return client;
}
