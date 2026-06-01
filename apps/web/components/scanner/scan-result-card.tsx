import type { ScanResult } from '@campusqr/types';
import { AlertTriangle, CheckCircle2, QrCode, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';

const tone = {
  authorized: 'border-green-500 bg-green-50 text-green-800',
  duplicate: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  unauthorized: 'border-red-500 bg-red-50 text-red-800',
  idle: 'border-dashed bg-card text-muted-foreground',
};

export function ScanResultCard({ result }: { result?: Partial<ScanResult> }) {
  const display = result?.display || 'idle';
  const Icon =
    display === 'authorized'
      ? CheckCircle2
      : display === 'duplicate' || display === 'warning'
        ? AlertTriangle
        : display === 'unauthorized'
          ? XCircle
          : QrCode;

  return (
    <Card className={cn('min-h-96 border-2', tone[display])}>
      <CardContent className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
        <Icon className="mb-4 h-20 w-20" />
        <h2 className="text-2xl font-semibold">{result?.message || 'Ready to scan'}</h2>
        {result?.student ? (
          <div className="mt-4">
            <p className="font-semibold">{result.student.full_name}</p>
            <p className="text-sm">{result.student.student_id}</p>
            <p className="text-sm">
              {result.student.department} · Batch {result.student.batch}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm">Point the camera at a CampusQR student ID.</p>
        )}
      </CardContent>
    </Card>
  );
}
