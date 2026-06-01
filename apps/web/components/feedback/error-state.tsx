import { AlertTriangle } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-5 w-5" />
        Unable to load
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
