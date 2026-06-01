import { StudentSchema } from '@campusqr/types';
import { z } from 'zod';
import { apiFetch } from '../api-client';

const StudentListSchema = z.array(StudentSchema.omit({ qr_payload: true }));

export const studentsApi = {
  list: (params: Record<string, string> = {}) =>
    apiFetch(`/students?${new URLSearchParams(params)}`, { schema: StudentListSchema }),
  get: (studentId: string) => apiFetch(`/students/${studentId}`, { schema: StudentSchema }),
  me: () => apiFetch('/students/me', { schema: StudentSchema }),
  register: (formData: FormData) => apiFetch('/students', { method: 'POST', body: formData }),
  qrImageUrl: (studentId: string) => `/api/students/${studentId}/qr-image`,
};
