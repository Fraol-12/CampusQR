export const reportsApi = {
  attendanceExcelUrl: (params: Record<string, string> = {}) =>
    `/api/reports/attendance/excel?${new URLSearchParams(params)}`,
  attendancePdfUrl: (params: Record<string, string> = {}) =>
    `/api/reports/attendance/pdf?${new URLSearchParams(params)}`,
  scansExcelUrl: (params: Record<string, string> = {}) =>
    `/api/reports/scans/excel?${new URLSearchParams(params)}`,
};
