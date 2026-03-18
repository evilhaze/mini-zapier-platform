function normalizeApiBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * API base URL for backend.
 *
 * - In production: ONLY use `NEXT_PUBLIC_API_URL` (no localhost fallbacks).
 * - In dev: allow fallback to localhost for local development.
 */
export const API_BASE = API_URL
  ? normalizeApiBaseUrl(API_URL)
  : isProduction
    ? ''
    : 'http://localhost:3001/api';

export async function api<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      'Missing NEXT_PUBLIC_API_URL. Set it to your backend base URL, e.g. "https://api.example.com" (without /api is ok).'
    );
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const payload = err as { error?: unknown; message?: unknown };
    const maybeError = payload.error;
    const maybeMessage = payload.message;

    const msg =
      typeof maybeError === 'string'
        ? maybeError
        : typeof maybeMessage === 'string'
          ? maybeMessage
          : typeof res.statusText === 'string'
            ? res.statusText
            : 'Request failed';

    // If backend returns structured validation errors, prefer a readable string.
    if (typeof maybeError !== 'string' && maybeError != null) {
      return Promise.reject(new Error(JSON.stringify(maybeError)));
    }

    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
