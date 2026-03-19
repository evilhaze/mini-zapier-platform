/**
 * AI workflow generator and editor assistant.
 * Supports RU/EN prompts, structured output, HTTP placeholders, post-validation and editor commands.
 */

const TRIGGERS = ['webhook', 'schedule', 'email', 'manual'] as const;
const ACTIONS = ['http', 'email', 'telegram', 'db', 'transform'] as const;
const ALLOWED_TYPES = new Set([...TRIGGERS, ...ACTIONS]);

const HTTP_PLACEHOLDER_URL = '[Вставьте URL API]';
const HTTP_PLACEHOLDER_HEADERS = '{}';
const HTTP_PLACEHOLDER_BODY = '{}';

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
    edges: Array<{ source: string; target: string }>;
  };
  /** Summary for the user: what was created, how it works. */
  summary?: string;
  /** Fields the user should fill manually (node id/label + field name). */
  missingFields?: Array<{ nodeId: string; nodeLabel?: string; field: string; hint?: string }>;
  message?: string;
};

/** Normalize for intent: lowercase, collapse spaces, optional transliterate Cyrillic to Latin for regex. */
function normalizePrompt(p: string): string {
  const t = p.trim().replace(/\s+/g, ' ');
  const lower = t.toLowerCase();
  // Build a Latin copy of Russian words for unified regex (common RU automation terms).
  const ruToIntent = [
    ['вебхук', 'webhook'], ['расписание', 'schedule'], ['каждый день', 'daily'], ['ежедневно', 'daily'],
    ['по расписанию', 'schedule'], ['крон', 'cron'], ['вручную', 'manual'], ['ручной', 'manual'],
    ['почта', 'email'], ['email', 'email'], ['письм', 'email'], ['телеграм', 'telegram'], ['телеграмм', 'telegram'],
    ['http', 'http'], ['api', 'api'], ['запрос', 'request'], ['url', 'url'], ['эндпоинт', 'endpoint'],
    ['база', 'db'], ['сохранить', 'save'], ['хранить', 'store'], ['преобразован', 'transform'], ['маппинг', 'map'],
    ['когда придет', 'when received'], ['при получении', 'when received'], ['отправь', 'send'], ['отправить', 'send'],
  ];
  let normalized = lower;
  for (const [ru, en] of ruToIntent) {
    normalized = normalized.split(ru).join(en);
  }
  return normalized;
}

function detectTrigger(prompt: string): (typeof TRIGGERS)[number] {
  const n = normalizePrompt(prompt);
  if (/\b(webhook|incoming request|when.*received|при получении)\b/.test(n)) return 'webhook';
  if (/\b(schedule|cron|every day|daily|9 am|9:00|hourly|weekly|расписание|ежедневно|крон)\b/.test(n)) return 'schedule';
  if (/\b(when.*email|email.*arrives|inbound email|письм|когда придет письм)\b/.test(n)) return 'email';
  if (/\b(manual|manually|on demand|click to run|вручную|ручной)\b/.test(n)) return 'manual';
  if (/\b(send.*email|email.*report|отправ.*письм|отчет.*email)\b/.test(n)) return 'schedule';
  return 'webhook';
}

function detectActions(prompt: string): (typeof ACTIONS)[number][] {
  const n = normalizePrompt(prompt);
  const list: (typeof ACTIONS)[number][] = [];
  if (/\b(http|api|request|endpoint|url|запрос|эндпоинт)\b/.test(n) && !list.includes('http')) list.push('http');
  if (/\b(telegram|tg|телеграм)\b/.test(n)) list.push('telegram');
  if (/\b(database|db|store|save.*to|persist|база|сохранить|хранить)\b/.test(n)) list.push('db');
  if (/\b(send.*email|email.*send|mail|email|отправ.*email)\b/.test(n) && !/\b(email trigger|inbound email|email arrives)\b/.test(n)) {
    list.push('email');
  }
  if (/\b(transform|map|convert|parse|преобразован|маппинг)\b/.test(n)) list.push('transform');
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

/** Build HTTP action config with placeholders; do not invent URLs. */
function defaultHttpConfig(): Record<string, string> {
  return {
    method: 'POST',
    url: HTTP_PLACEHOLDER_URL,
    headers: HTTP_PLACEHOLDER_HEADERS,
    body: HTTP_PLACEHOLDER_BODY,
  };
}

/** Post-validate draft and collect missingFields. */
function collectMissingFields(
  nodes: WorkflowDraft['definitionJson']['nodes']
): WorkflowDraft['missingFields'] {
  const out: NonNullable<WorkflowDraft['missingFields']> = [];
  for (const n of nodes) {
    const label = (n.name ?? n.type) as string;
    if (n.type === 'http') {
      const url = (n.config?.url as string) ?? '';
      if (!url || url === HTTP_PLACEHOLDER_URL || url.trim() === '') {
        out.push({ nodeId: n.id, nodeLabel: label, field: 'url', hint: 'URL is required' });
      }
      const headers = (n.config?.headers as string) ?? '';
      if (headers && headers !== '{}') {
        try {
          JSON.parse(headers);
        } catch {
          out.push({ nodeId: n.id, nodeLabel: label, field: 'headers', hint: 'Must be valid JSON' });
        }
      }
    }
    if (n.type === 'telegram') {
      if (!(n.config?.botToken as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'botToken', hint: 'Bot token required' });
      if (!(n.config?.chatId as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'chatId', hint: 'Chat ID required' });
    }
    // Action "Send email" (id starts with action-); trigger "email" has different config.
    if (n.type === 'email' && String(n.id).startsWith('action-')) {
      const to = (n.config?.to as string)?.trim();
      if (!to) out.push({ nodeId: n.id, nodeLabel: label, field: 'to', hint: 'Recipient required' });
      if (!(n.config?.subject as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'subject', hint: 'Subject required' });
    }
  }
  return out.length ? out : undefined;
}

/** Build short summary for the user. */
function buildSummary(
  trigger: string,
  actionTypes: string[],
  missingCount: number,
  promptLang: 'en' | 'ru'
): string {
  const parts: string[] = [];
  if (promptLang === 'ru') {
    parts.push(`Создан workflow: триггер «${trigger}», шаги: ${actionTypes.join(', ')}.`);
    if (missingCount > 0) parts.push(`Нужно заполнить ${missingCount} полей вручную (см. список ниже).`);
    parts.push('Сохраните черновик и откройте редактор, чтобы указать URL, ключи и т.д.');
  } else {
    parts.push(`Created workflow: trigger «${trigger}», steps: ${actionTypes.join(', ')}.`);
    if (missingCount > 0) parts.push(`${missingCount} field(s) need to be filled manually (see list below).`);
    parts.push('Save the draft and open the editor to set URL, keys, etc.');
  }
  return parts.join(' ');
}

function detectPromptLang(prompt: string): 'en' | 'ru' {
  const cyrillic = /[\u0400-\u04FF]/;
  return cyrillic.test(prompt) ? 'ru' : 'en';
}

export function generateWorkflowFromPrompt(prompt: string): WorkflowDraft {
  const normalized = normalizePrompt(prompt);
  const trigger = detectTrigger(normalized);
  const actionTypes = detectActions(normalized);

  const nodes: WorkflowDraft['definitionJson']['nodes'] = [];
  const edges: WorkflowDraft['definitionJson']['edges'] = [];
  const step = 140;
  let y = 60;

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
    const defaultConfig =
      type === 'http'
        ? defaultHttpConfig()
        : type === 'telegram'
          ? { botToken: '', chatId: '', text: '' }
          : type === 'email'
            ? { to: '', subject: '', body: '' }
            : type === 'db'
              ? { mapping: '' }
              : type === 'transform'
                ? { mapping: '{}' }
                : {};
    const defaultName =
      type === 'http' ? 'HTTP request' : type === 'db' ? 'Save to database' : type === 'telegram' ? 'Send Telegram' : type === 'email' ? 'Send email' : 'Transform';
    nodes.push({
      id,
      type: type,
      config: defaultConfig,
      name: defaultName,
      position: { x: 80, y },
    });
    edges.push({ source: prevId, target: id });
    prevId = id;
    y += step;
  });

  const name = suggestName(prompt, trigger, safeActionTypes);
  const description = suggestDescription(prompt, trigger, safeActionTypes);
  const missingFields = collectMissingFields(nodes);
  const lang = detectPromptLang(prompt);
  const summary = buildSummary(trigger, safeActionTypes, missingFields?.length ?? 0, lang);

  return {
    name: name.length > 255 ? name.slice(0, 252) + '...' : name,
    description,
    definitionJson: { nodes, edges },
    summary,
    missingFields,
    message: summary,
  };
}

// --- Editor command types and handler ---

export type EditorOpAddNode = {
  op: 'add_node';
  node: {
    id: string;
    type: string;
    config?: Record<string, unknown>;
    name?: string;
    position?: { x: number; y: number };
  };
  connectFrom?: string; // source node id to connect from
};

export type EditorOpUpdateNode = {
  op: 'update_node';
  nodeId: string;
  config?: Record<string, unknown>;
  name?: string;
};

export type EditorOpConnect = {
  op: 'connect_nodes';
  source: string;
  target: string;
};

export type EditorOpDeleteNode = { op: 'delete_node'; nodeId: string };
export type EditorOpDeleteEdge = { op: 'delete_edge'; source: string; target: string };

export type EditorOperation =
  | EditorOpAddNode
  | EditorOpUpdateNode
  | EditorOpConnect
  | EditorOpDeleteNode
  | EditorOpDeleteEdge;

export type EditorCommandResult =
  | { type: 'explain'; summary: string }
  | { type: 'missing_fields'; missingFields: Array<{ nodeId: string; nodeLabel?: string; field: string; hint?: string }> }
  | { type: 'apply_operations'; operations: EditorOperation[]; summary: string };

type DefinitionInput = {
  nodes: Array<{ id: string; type?: string; config?: Record<string, unknown>; name?: string; position?: { x: number; y: number } }>;
  edges: Array<{ source: string; target: string }>;
};

function explainWorkflow(def: DefinitionInput): string {
  const nodes = def.nodes ?? [];
  const edges = def.edges ?? [];
  const trigger = nodes.find((n) => ['webhook', 'schedule', 'email', 'manual'].includes(String(n.type)));
  const actions = nodes.filter((n) => !['webhook', 'schedule', 'email', 'manual'].includes(String(n.type)));
  const parts: string[] = [];
  if (trigger) parts.push(`Trigger: ${trigger.name ?? trigger.type ?? trigger.id}.`);
  parts.push(`Actions (${actions.length}): ${actions.map((a) => a.name ?? a.type ?? a.id).join(' → ')}.`);
  parts.push(`Connections: ${edges.length} edge(s).`);
  return parts.join(' ');
}

type MissingFieldItem = { nodeId: string; nodeLabel?: string; field: string; hint?: string };

function collectMissingFieldsFromDef(nodes: DefinitionInput['nodes']): MissingFieldItem[] {
  const out: MissingFieldItem[] = [];
  for (const n of nodes ?? []) {
    const label = (n.name ?? n.type ?? n.id) as string;
    const type = String(n.type ?? '');
    if (type === 'http') {
      const url = (n.config?.url as string) ?? '';
      if (!url || url === HTTP_PLACEHOLDER_URL || String(url).trim() === '') {
        out.push({ nodeId: n.id, nodeLabel: label, field: 'url', hint: 'URL is required' });
      }
    }
    if (type === 'telegram') {
      if (!(n.config?.botToken as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'botToken', hint: 'Bot token required' });
      if (!(n.config?.chatId as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'chatId', hint: 'Chat ID required' });
    }
    if (type === 'email' && String(n.id).startsWith('action-')) {
      if (!(n.config?.to as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'to', hint: 'Recipient required' });
      if (!(n.config?.subject as string)?.trim()) out.push({ nodeId: n.id, nodeLabel: label, field: 'subject', hint: 'Subject required' });
    }
  }
  return out;
}

/** Parse simple Russian/English commands for editor. */
function parseEditorCommand(
  prompt: string,
  def: DefinitionInput,
  selectedNodeId: string | null
): EditorCommandResult | null {
  const n = normalizePrompt(prompt);
  const nodes = def.nodes ?? [];
  const edges = def.edges ?? [];

  // "explain" / "объясни" / "what does this workflow do"
  if (/\b(explain|describe|what does|how does|объясни|описание|что делает|как работает)\b/.test(n)) {
    return { type: 'explain', summary: explainWorkflow(def) };
  }

  // "missing" / "чего не хватает" / "what's missing"
  if (/\b(missing|what.?s missing|чего не хватает|что заполнить|что указать|не заполнен)\b/.test(n)) {
    const missingFields = collectMissingFieldsFromDef(nodes);
    return { type: 'missing_fields', missingFields };
  }

  // "add [type] after this" / "добавь ... после"
  const addAfterMatch = n.match(/\b(add|добавь|добавить)\s+(http|telegram|email|db|transform|action)\s*(after|после|следующим)?/);
  if (addAfterMatch && selectedNodeId) {
    const actionType = addAfterMatch[2] as typeof ACTIONS[number];
    if (!ALLOWED_TYPES.has(actionType)) return null;
    const selected = nodes.find((x) => x.id === selectedNodeId);
    if (!selected) return null;
    const y = (selected.position?.y ?? 0) + 140;
    const newId = `action-${Date.now()}`;
    const config =
      actionType === 'http'
        ? defaultHttpConfig()
        : actionType === 'telegram'
          ? { botToken: '', chatId: '', text: '' }
          : actionType === 'email'
            ? { to: '', subject: '', body: '' }
            : actionType === 'db'
              ? { mapping: '' }
              : { mapping: '{}' };
    const nameMap: Record<string, string> = {
      http: 'HTTP request',
      telegram: 'Send Telegram',
      email: 'Send email',
      db: 'Save to database',
      transform: 'Transform',
    };
    const ops: EditorOperation[] = [
      {
        op: 'add_node',
        node: {
          id: newId,
          type: actionType,
          config,
          name: nameMap[actionType] ?? actionType,
          position: { x: 80, y },
        },
        connectFrom: selectedNodeId,
      },
    ];
    return { type: 'apply_operations', operations: ops, summary: `Added ${actionType} node after selected node.` };
  }

  // "connect trigger to [id or first action]" — simple: connect first trigger to first action if not connected
  if (/\b(connect|соедин|свяжи)\b/.test(n) && nodes.length >= 2 && edges.length === 0) {
    const trigger = nodes.find((x) => ['webhook', 'schedule', 'email', 'manual'].includes(String(x.type)));
    const firstAction = nodes.find((x) => !['webhook', 'schedule', 'email', 'manual'].includes(String(x.type)));
    if (trigger && firstAction) {
      return {
        type: 'apply_operations',
        operations: [{ op: 'connect_nodes', source: trigger.id, target: firstAction.id }],
        summary: 'Connected trigger to first action.',
      };
    }
  }

  return null;
}

export type EditorCommandInput = {
  definitionJson: DefinitionInput;
  prompt: string;
  selectedNodeId?: string | null;
};

export function handleEditorCommand(input: EditorCommandInput): EditorCommandResult {
  const { definitionJson, prompt, selectedNodeId } = input;
  const parsed = parseEditorCommand(prompt, definitionJson, selectedNodeId ?? null);
  if (parsed) return parsed;
  // Fallback: explain
  return {
    type: 'explain',
    summary: explainWorkflow(definitionJson) + '\n\nCommand not recognized. Try: "explain", "missing fields", "add http after this".',
  };
}
