import { z } from 'zod';

export const RoleSchema = z.enum([
  'admin',
  'security',
  'cafeteria',
  'teacher',
  'librarian',
  'student',
]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: RoleSchema,
  fullName: z.string(),
  studentRefId: z.number().nullable().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const StudentSchema = z.object({
  id: z.number(),
  student_id: z.string(),
  full_name: z.string(),
  department: z.string(),
  batch: z.string(),
  email: z.string().email().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  qr_payload: z.string().optional(),
  status: z.enum(['active', 'suspended', 'graduated']),
  cafeteria_balance: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Student = z.infer<typeof StudentSchema>;

export const ScanStatusSchema = z.enum(['valid', 'invalid', 'duplicate', 'unauthorized']);
export const ScanDisplaySchema = z.enum([
  'authorized',
  'unauthorized',
  'duplicate',
  'warning',
  'idle',
]);

export const ScanResultSchema = z.object({
  success: z.boolean(),
  status: ScanStatusSchema,
  message: z.string(),
  display: ScanDisplaySchema,
  student: StudentSchema.optional(),
  logId: z.number().optional(),
  alreadyMarked: z.boolean().optional(),
  transaction: z
    .object({
      amount: z.number(),
      balanceAfter: z.number(),
    })
    .optional(),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;

export const ScanLogSchema = z.object({
  id: z.number(),
  student_id: z.string().nullable(),
  scan_type: z.enum(['entry', 'cafeteria', 'library', 'attendance']),
  status: ScanStatusSchema,
  message: z.string().nullable(),
  scanned_by: z.number().nullable(),
  metadata: z.unknown().nullable().optional(),
  created_at: z.string(),
  scanner_name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
});
export type ScanLog = z.infer<typeof ScanLogSchema>;

export const AttendanceRowSchema = z.object({
  id: z.number(),
  student_id: z.string(),
  course: z.string(),
  attendance_date: z.string(),
  attendance_time: z.string(),
  status: z.string(),
  marked_by: z.number().nullable().optional(),
  created_at: z.string().optional(),
  full_name: z.string().optional(),
  department: z.string().optional(),
  photo_url: z.string().nullable().optional(),
});
export type AttendanceRow = z.infer<typeof AttendanceRowSchema>;

export const CourseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  department: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

export const LibraryBookSchema = z.object({
  id: z.number(),
  student_id: z.string(),
  book_name: z.string(),
  isbn: z.string().nullable(),
  borrow_date: z.string(),
  due_date: z.string(),
  return_date: z.string().nullable(),
  status: z.enum(['borrowed', 'returned', 'overdue']),
  fine_amount: z.number(),
  processed_by: z.number().nullable().optional(),
  created_at: z.string().optional(),
  daysOverdue: z.number().optional(),
  full_name: z.string().optional(),
  department: z.string().optional(),
});
export type LibraryBook = z.infer<typeof LibraryBookSchema>;

export const DashboardStatsSchema = z.object({
  totalStudents: z.number(),
  todayEntries: z.number(),
  invalidScans: z.number(),
  cafeteriaToday: z.number(),
  attendanceToday: z.number(),
  libraryActive: z.number(),
  duplicateToday: z.number(),
  hourlyEntries: z.array(z.object({ hour: z.string(), count: z.number() })),
  recentScans: z.array(ScanLogSchema),
  scanBreakdown: z.array(
    z.object({
      scan_type: z.string(),
      status: z.string(),
      count: z.number(),
    })
  ),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
