import { Card, CardContent } from '@/components/ui/card';

export function ScannerFrame({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-96 flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 h-64 w-full max-w-sm rounded-xl bg-black/90" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared QR camera engine will be connected during the scanner module migration.
        </p>
      </CardContent>
    </Card>
  );
}
