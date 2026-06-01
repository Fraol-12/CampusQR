import { DashboardStatsSchema } from '@campusqr/types';
import { apiFetch } from '../api-client';

export const dashboardApi = {
  stats: () => apiFetch('/dashboard/stats', { schema: DashboardStatsSchema }),
};
