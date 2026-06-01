import { ScanLogSchema, ScanResultSchema } from '@campusqr/types';
import { z } from 'zod';
import { apiFetch } from '../api-client';

export const scansApi = {
  entry: (qrData: string) =>
    apiFetch('/scans/entry', { method: 'POST', body: { qrData }, schema: ScanResultSchema }),
  cafeteria: (qrData: string, amount: number) =>
    apiFetch('/scans/cafeteria', {
      method: 'POST',
      body: { qrData, amount },
      schema: ScanResultSchema,
    }),
  logs: (params: Record<string, string> = {}) =>
    apiFetch(`/scans/logs?${new URLSearchParams(params)}`, { schema: z.array(ScanLogSchema) }),
};
