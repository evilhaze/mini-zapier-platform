/**
 * MVP AI workflow generator.
 * Parses natural language and returns a workflow draft using only supported node types.
 * Can be replaced with an LLM (e.g. OpenAI) for production.
 */

const TRIGGERS = ['webhook', 'schedule', 'email', 'manual'] as const;
const ACTIONS = ['http', 'email', 'telegram', 'db', 'transform'] as const;
const ALLOWED_TYPES = new Set([...TRIGGERS, ...ACTIONS]);

export type WorkflowDraft = {
  name: string;
  description: string;
  definitionJson: {
    nodes: Array<{
      id: string;
      type: string;
      config?: Record<string, unknown>;
      name?: string;
      position?: { x: number; y: number };
    }>;
    edges: Array< { source: string; target: string }>;
  };
  message?: string;
};

function normalizePrompt(p: string): string {
  return p.toLowerCase().trim().replace(/\s+/g, ' ');
}

function detectTrigger(prompt: string): (typeof TRIGGERS)[number] {
  if (/\b(webhook|incoming request|when.*received)\b/.test(prompt)) return 'webhook';
  if (/\b(schedule|cron|every day|daily|9 am|9:00|hourly|weekly)\b/.test(prompt)) return 'schedule';
  if (/\b(when.*email|email.*arrives|inbound email)\b/.test(prompt)) return 'email';
  if (/\b(manual|manually|on demand|click to run)\b/.test(prompt)) return 'manual';
  if (/\b(send.*email|email.*report)\b/.test(prompt)) return 'schedule'; // "send email report" -> schedule
  return 'webhook';
}

function detectActions(prompt: string): (typeof ACTIONS)[number][] {
  const list: (typeof ACTIONS)[number][] = [];
  if (/\b(http|api|request|endpoint|url)\b/.test(prompt) && !list.includes('http')) list.push('http');
  if (/\b(telegram|tg)\b/.test(prompt)) list.push('telegram');
  if (/\b(database|db|store|save.*to|persist)\b/.test(prompt)) list.push('db');
  if (/\b(send.*email|email.*send|mail)\b/.test(prompt)) list.push('email');
  if (/\b(transform|map|convert|parse)\b/.test(prompt)) list.push('transform');
  if (list.length === 0) list.push('http');
  return list;
}

function suggestName(prompt: string, trigger: string, actions: string[]): string {
  const first = prompt.trim().slice(0, 50);
  if (first.length >= 10) return first.replace(/\.$/, '');
  const parts = [trigger, ...actions];
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' → ');
}

function suggestDescription(prompt: string, trigger: string, actionTypes: string[]): string {
  if (prompt.length > 20) return prompt.slice(0, 200).trim();
  const t = trigger === 'webhook' ? 'When a webhook is received' : trigger === 'schedule' ? 'Runs on a schedule' : trigger === 'manual' ? 'Runs manually' : 'When an email arrives';
  const a = actionTypes.length ? actionTypes.join(', then ') : 'process data';
  return `${t}, ${a}.`;
}

export function generateWorkflowFromPrompt(prompt: string): WorkflowDraft {
  const normalized = normalizePrompt(prompt);
  const trigger = detectTrigger(normalized);
  const actionTypes = detectActions(normalized);

  const nodes: WorkflowDraft['definitionJson']['nodes'] = [];
  const edges: WorkflowDraft['definitionJson']['edges'] = [];
  const step = 140;
  let y = 60;

  // Guardrails: only allowed types (already enforced by detectTrigger/detectActions)
  const safeActionTypes = actionTypes.filter((t) => ALLOWED_TYPES.has(t));

  const triggerId = 'trigger-1';
  const triggerConfig = trigger === 'schedule' ? { cron: '0 9 * * *' } : {};
  nodes.push({
    id: triggerId,
    type: trigger,
    config: triggerConfig,
    name: trigger === 'schedule' ? 'Schedule trigger' : `${trigger} trigger`,
    position: { x: 80, y },
  });
  y += step;

  let prevId = triggerId;
  safeActionTypes.forEach((type, i) => {
    const id = `action-${i + 1}`;
    nodes.push({
      id,
      type,
      config: type === 'http' ? { url: '', method: 'POST' } : {},
      name: type === 'http' ? 'HTTP request' : type === 'db' ? 'Save to database' : type === 'telegram' ? 'Send Telegram' : type === 'email' ? 'Send email' : 'Transform',
      position: { x: 80, y },
    });
    edges.push({ source: prevId, target: id });
    prevId = id;
    y += step;
  });

  const name = suggestName(prompt, trigger, actionTypes);
  const description = suggestDescription(prompt, trigger, actionTypes);

  return {
    name: name.length > 255 ? name.slice(0, 252) + '...' : name,
    description,
    definitionJson: { nodes, edges },
    message: undefined,
  };
}
