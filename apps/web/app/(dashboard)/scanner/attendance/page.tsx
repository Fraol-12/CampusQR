import { ScanResultCard } from '@/components/scanner/scan-result-card';
import { ScannerFrame } from '@/components/scanner/scanner-frame';

export default function AttendanceScannerPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ScannerFrame title="Attendance Scanner" />
      <ScanResultCard />
    </div>
  );
}
