'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/use-auth';

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'admin@university.edu',
      password: 'admin123',
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-campus-primary via-sky-900 to-campus-accent p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <QrCode className="h-6 w-6" />
          </div>
          <CardTitle>CampusQR</CardTitle>
          <CardDescription>Smart QR Campus Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => login.mutate(values))}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register('password')}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <Button className="w-full" disabled={login.isPending} type="submit">
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo accounts</p>
            <p>admin@university.edu / admin123</p>
            <p>security@university.edu / security123</p>
            <p>cafeteria@university.edu / cafe123</p>
            <p>teacher@university.edu / teacher123</p>
            <p>librarian@university.edu / library123</p>
            <p>alex.j@student.edu / student123</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
