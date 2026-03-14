import type { ActionHandler } from '../types.js';

/**
 * HTTP action: method, url, headers, body.
 * Uses fetch. Body is sent as JSON when object.
 */
export const httpHandler: ActionHandler = async (config, _input) => {
  const url = (config.url as string) ?? '';
  if (!url) throw new Error('http action: url is required');

  const method = ((config.method as string) ?? 'GET').toUpperCase();
  const headers = (config.headers as Record<string, string>) ?? {};
  const body = config.body;

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body != null && method !== 'GET') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
};
