import type { ActionNode, StepContext } from './types.js';

async function runHttp(config: Record<string, unknown>, ctx: StepContext): Promise<Record<string, unknown>> {
  const url = config.url as string;
  const method = (config.method as string) || 'GET';
  const body = config.body as Record<string, unknown> | undefined;
  const headers = (config.headers as Record<string, string>) || {};
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function runEmail(config: Record<string, unknown>, ctx: StepContext): Promise<Record<string, unknown>> {
  // MVP: simulate sending (no real SMTP)
  const to = config.to as string;
  const subject = config.subject as string;
  const body = config.body as string;
  return { sent: true, to, subject, bodyLength: body?.length ?? 0 };
}

async function runTelegram(config: Record<string, unknown>, ctx: StepContext): Promise<Record<string, unknown>> {
  const token = config.botToken as string;
  const chatId = config.chatId as string;
  const text = config.text as string;
  if (!token || !chatId) return { ok: false, error: 'Missing botToken or chatId' };
  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );
  const data = await res.json();
  return { ok: data.ok === true, ...data };
}

async function runDb(config: Record<string, unknown>, ctx: StepContext): Promise<Record<string, unknown>> {
  const operation = (config.operation as string) || 'query';
  const query = config.query as string;
  // MVP: no real DB connection, return mock
  if (operation === 'query' && query) {
    return { rows: [], rowCount: 0 };
  }
  return { success: true, operation };
}

async function runTransform(config: Record<string, unknown>, ctx: StepContext): Promise<Record<string, unknown>> {
  const mode = (config.mode as string) || 'map';
  const input = ctx.previousOutput;
  if (mode === 'map' && config.mapping) {
    const mapping = config.mapping as Record<string, string>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mapping)) {
      out[k] = v.startsWith('$.') ? (input as Record<string, unknown>)[v.slice(2)] : v;
    }
    return out;
  }
  if (mode === 'filter' && config.path) {
    const path = config.path as string;
    const val = (input as Record<string, unknown>)[path];
    return { [path]: val };
  }
  return { ...input };
}

const runners: Record<string, (config: Record<string, unknown>, ctx: StepContext) => Promise<Record<string, unknown>>> = {
  http: runHttp,
  email: runEmail,
  telegram: runTelegram,
  db: runDb,
  transform: runTransform,
};

export async function runAction(node: ActionNode, ctx: StepContext): Promise<Record<string, unknown>> {
  const run = runners[node.type];
  if (!run) throw new Error(`Unknown action type: ${node.type}`);
  return run(node.config, ctx);
}
