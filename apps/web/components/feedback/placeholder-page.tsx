import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PlaceholderPage({
  title,
  description,
  legacyPath,
}: {
  title: string;
  description: string;
  legacyPath?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This production Next.js shell is ready. The full module migration will replace the legacy
          static page in Phase 3 while preserving the existing Express API contract.
        </p>
        {legacyPath ? (
          <p className="text-sm">
            Legacy path: <code className="rounded bg-muted px-2 py-1">{legacyPath}</code>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
