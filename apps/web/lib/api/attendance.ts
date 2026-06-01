import { AttendanceRowSchema, CourseSchema, ScanResultSchema } from '@campusqr/types';
import { z } from 'zod';
import { apiFetch } from '../api-client';

export const attendanceApi = {
  scan: (qrData: string, course: string) =>
    apiFetch('/attendance/scan', {
      method: 'POST',
      body: { qrData, course },
      schema: ScanResultSchema,
    }),
  list: (params: Record<string, string> = {}) =>
    apiFetch(`/attendance?${new URLSearchParams(params)}`, {
      schema: z.array(AttendanceRowSchema),
    }),
  courses: () => apiFetch('/attendance/courses', { schema: z.array(CourseSchema) }),
};
