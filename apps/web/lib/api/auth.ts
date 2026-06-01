import { AuthResponseSchema, UserSchema } from '@campusqr/types';
import { apiFetch } from '../api-client';

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
      schema: AuthResponseSchema,
    }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me', { schema: UserSchema }),
};
