import { LibraryBookSchema, ScanResultSchema } from '@campusqr/types';
import { z } from 'zod';
import { apiFetch } from '../api-client';

const LibraryVerifySchema = ScanResultSchema.extend({
  borrowedBooks: z.array(LibraryBookSchema).optional(),
});

export const libraryApi = {
  verify: (qrData: string) =>
    apiFetch('/library/verify', {
      method: 'POST',
      body: { qrData },
      schema: LibraryVerifySchema,
    }),
  borrow: (data: { studentId: string; bookName: string; isbn?: string; dueDays?: number }) =>
    apiFetch('/library/borrow', { method: 'POST', body: data }),
  returnBook: (id: number | string) => apiFetch(`/library/return/${id}`, { method: 'POST' }),
  books: (params: Record<string, string> = {}) =>
    apiFetch(`/library/books?${new URLSearchParams(params)}`, {
      schema: z.array(LibraryBookSchema),
    }),
};
