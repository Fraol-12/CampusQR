import { ScanResultCard } from '@/components/scanner/scan-result-card';
import { ScannerFrame } from '@/components/scanner/scanner-frame';

export default function LibraryScannerPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ScannerFrame title="Library Scanner" />
      <ScanResultCard />
    </div>
  );
}
