import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions<TSchema extends z.ZodTypeAny> = Omit<RequestInit, 'body'> & {
  body?: unknown;
  schema?: TSchema;
};

export async function apiFetch<TSchema extends z.ZodTypeAny>(
  path: string,
  options: ApiFetchOptions<TSchema> = {}
): Promise<z.infer<TSchema>> {
  const { schema, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | null | undefined;

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  } else {
    requestBody = body as BodyInit | null | undefined;
  }

  const response = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...init,
    headers: requestHeaders,
    body: requestBody,
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status, data);
  }

  return schema ? schema.parse(data) : data;
}
