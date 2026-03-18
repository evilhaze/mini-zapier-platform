'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Node } from '@xyflow/react';
import { toast } from 'sonner';
import type { FlowNodeData } from './utils';
import { NODE_LABELS } from './types';
import { API_BASE } from '@/lib/api';
import { fetchExecutionById, type ExecutionDetail } from '@/lib/executions-api';

type Props = {
  node: Node<FlowNodeData> | null;
  onUpdate: (nodeId: string, data: Partial<FlowNodeData>) => void;
  workflowId: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  helper,
  error,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  helper?: string;
  error?: string | null;
  multiline?: boolean;
}) {
  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-800">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${inputClass} resize-none font-mono`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {helper && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{helper}</p>}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function JsonField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string | null;
  rows?: number;
}) {
  return (
    <Field
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      multiline
      helper={helper}
      error={error}
      hint={undefined}
    />
  );
}

function isValidEmail(value: string): boolean {
  // Simple MVP validator (not RFC exhaustive).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidCron(expr: string): boolean {
  const v = expr.trim();
  if (!v) return false;
  const parts = v.split(/\s+/);
  if (parts.length !== 5) return false;
  // Lightweight MVP validation: allow digits, *, /, -, , only
  return parts.every((p) => /^[\d*/,\-]+$/.test(p));
}

function nextRunPreview(freq: string, time: string): { preview: string; nextRun: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const humanTime = time && /^\d{2}:\d{2}$/.test(time) ? time : '';
  const [hh, mm] = humanTime ? humanTime.split(':').map((x) => Number(x)) : [0, 0];

  const format = (d: Date) =>
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (freq === 'every5') {
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(Math.ceil((now.getMinutes() + 0.0001) / 5) * 5);
    if (next <= now) next.setMinutes(next.getMinutes() + 5);
    return { preview: 'Runs every 5 minutes', nextRun: format(next) };
  }
  if (freq === 'hourly') {
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(0);
    next.setHours(now.getHours() + 1);
    return { preview: 'Runs every hour', nextRun: format(next) };
  }
  if (freq === 'daily') {
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setHours(hh, mm, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return { preview: `Runs daily at ${humanTime || '00:00'}`, nextRun: format(next) };
  }
  if (freq === 'weekly') {
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setHours(hh, mm, 0, 0);
    // Next Monday (1). JS: 0=Sun..6=Sat.
    const day = next.getDay();
    const daysUntilMon = (1 - day + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMon);
    if (next <= now) next.setDate(next.getDate() + 7);
    return { preview: `Runs weekly (Mon) at ${humanTime || '00:00'}`, nextRun: format(next) };
  }
  return { preview: 'Schedule', nextRun: '—' };
}

export function SettingsPanel({ node, onUpdate, workflowId }: Props) {
  const [copiedKey, setCopiedKey] = useState<null | 'url' | 'payload' | 'curl'>(null);
  const [testing, setTesting] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [lastExecutionId, setLastExecutionId] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<ExecutionDetail | null>(null);
  const [lastExecutionLoading, setLastExecutionLoading] = useState(false);

  const updateConfig = useCallback(
    (patch: Record<string, unknown>) => {
      if (!node) return;
      onUpdate(node.id, { config: { ...node.data.config, ...patch } });
    },
    [node, onUpdate]
  );

  const update = useCallback(
    (patch: Partial<FlowNodeData>) => {
      if (node) onUpdate(node.id, patch);
    },
    [node, onUpdate]
  );

  if (!node) return null;

  const { type, label, config = {}, name } = node.data;
  const nodeKind = node.type as string; // 'trigger' | 'action'
  const typeLabel = NODE_LABELS[type] ?? type;

  const cfg = config as Record<string, string | undefined>;

  const currentStep = useMemo(() => {
    if (!lastExecution || !Array.isArray(lastExecution.steps)) return null;
    return lastExecution.steps.find((s) => s.nodeId === node.id) ?? null;
  }, [lastExecution, node.id]);

  const nodeDescription = useMemo(() => {
    switch (type) {
      case 'webhook':
        return 'Starts the workflow when an external system sends an HTTP request.';
      case 'schedule':
        return 'Runs the workflow automatically on a schedule.';
      case 'manual':
        return 'Lets you run the workflow manually from the editor.';
      case 'email':
        return nodeKind === 'action'
          ? 'Sends an outgoing email to the recipient you specify.'
          : 'Triggers the workflow when an email arrives (MVP: not fully implemented).';
      case 'telegram':
        return 'Sends a message to a Telegram chat, group, or channel.';
      case 'http':
        return 'Calls an external API or webhook over HTTP.';
      case 'db':
        return 'Stores data inside the workflow system (useful for saving payloads).';
      case 'transform':
        return 'Reshapes data for the next step (mapping/template).';
      default:
        return 'Configure this node.';
    }
  }, [nodeKind, type]);

  const webhookUrl = useMemo(() => {
    // Backend endpoint: POST /api/triggers/webhook/:workflowId
    // For MVP we scope webhooks to the workflow; node panel surfaces it for external systems.
    return `${API_BASE}/triggers/webhook/${workflowId}`;
  }, [workflowId]);

  const samplePayload = useMemo(() => ({ message: 'Hello from webhook' }), []);
  const samplePayloadText = useMemo(
    () => JSON.stringify(samplePayload, null, 2),
    [samplePayload]
  );
  const curlExample = useMemo(() => {
    const escaped = JSON.stringify(samplePayload).replace(/"/g, '\\"');
    return `curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -d "${escaped}"`;
  }, [samplePayload, webhookUrl]);

  const copyToClipboard = useCallback(async (text: string, key: 'url' | 'payload' | 'curl') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    } catch {
      toast.error('Copy failed');
    }
  }, []);

  const handleTestWebhook = useCallback(async () => {
    setTesting(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello from webhook test' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          (body as { error?: string }).error || `Failed (${res.status})`;
        throw new Error(msg);
      }
      const data = (await res.json().catch(() => ({}))) as { executionId?: string };
      if (data.executionId) setLastExecutionId(data.executionId);
      toast.success('Webhook test queued');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Webhook test failed');
    } finally {
      setTesting(false);
    }
  }, [webhookUrl]);

  useEffect(() => {
    let cancelled = false;
    if (!lastExecutionId) return;

    async function poll() {
      setLastExecutionLoading(true);
      try {
        // Poll briefly so MVP users see results without leaving the editor.
        for (let i = 0; i < 12; i++) {
          const ex = await fetchExecutionById(lastExecutionId);
          if (cancelled) return;
          setLastExecution(ex);
          if (ex.status !== 'pending' && ex.status !== 'running') break;
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        if (!cancelled) {
          setLastExecution(null);
        }
      } finally {
        if (!cancelled) setLastExecutionLoading(false);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [lastExecutionId]);

  const validation = useMemo(() => {
    const errors: Record<string, string | null> = {};

    if (type === 'telegram') {
      errors.botToken = (cfg.botToken ?? '').trim() ? null : 'Bot token is required';
      errors.chatId = (cfg.chatId ?? '').trim() ? null : 'Chat ID is required';
      errors.text = (cfg.text ?? '').trim() ? null : 'Message is required';
    }

    if (nodeKind === 'action' && type === 'email') {
      const to = (cfg.to ?? '').trim();
      errors.to = !to ? 'Recipient is required' : isValidEmail(to) ? null : 'Invalid email address';
      errors.subject = (cfg.subject ?? '').trim() ? null : 'Subject is required';
      errors.body = (cfg.body ?? '').trim() ? null : 'Body is required';
    }

    if (type === 'http') {
      const url = (cfg.url ?? '').trim();
      try {
        // eslint-disable-next-line no-new
        if (url) new URL(url);
        errors.url = url ? null : 'URL is required';
      } catch {
        errors.url = 'Invalid URL';
      }

      const headers = (cfg.headers ?? '').trim();
      if (headers) {
        try {
          const parsed = JSON.parse(headers);
          errors.headers = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? null
            : 'Headers must be a JSON object';
        } catch (e) {
          errors.headers = e instanceof Error ? e.message : 'Invalid JSON';
        }
      } else {
        errors.headers = null;
      }

      const body = (cfg.body ?? '').trim();
      if (body) {
        try {
          JSON.parse(body);
          errors.httpBody = null;
        } catch (e) {
          errors.httpBody = e instanceof Error ? e.message : 'Invalid JSON';
        }
      } else {
        errors.httpBody = null;
      }
    }

    if (type === 'transform') {
      const rules = (cfg.mapping ?? '').trim();
      if (rules) {
        try {
          JSON.parse(rules);
          errors.mapping = null;
        } catch (e) {
          errors.mapping = e instanceof Error ? e.message : 'Invalid JSON';
        }
      } else {
        errors.mapping = 'Rules are required';
      }
    }

    if (type === 'schedule') {
      const cron = (cfg.cron ?? '').trim();
      if (cron && !isValidCron(cron)) {
        errors.cron = 'Cron must have 5 fields (e.g. 0 * * * *)';
      } else {
        errors.cron = null;
      }
    }

    return errors;
  }, [cfg, nodeKind, type]);

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="border-b border-slate-200/80 px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Node settings
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
          {typeLabel}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {nodeDescription}
        </p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
        {/* Status / Result */}
        {(lastExecutionLoading || lastExecution) && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                Status
              </p>
              {lastExecutionId && (
                <span className="text-[11px] font-mono text-slate-500">
                  {lastExecutionId.slice(0, 8)}…
                </span>
              )}
            </div>
            {lastExecutionLoading && (
              <p className="text-sm text-slate-600">Running…</p>
            )}
            {lastExecution && (
              <div className="space-y-1">
                <p className="text-sm text-slate-700">
                  Last execution:{' '}
                  <span className="font-semibold text-slate-900">
                    {lastExecution.status}
                  </span>
                </p>
                {lastExecution.errorMessage && (
                  <p className="text-sm text-red-600">{lastExecution.errorMessage}</p>
                )}
                {currentStep && (
                  <p className="text-sm text-slate-700">
                    This node:{' '}
                    <span className="font-semibold text-slate-900">
                      {currentStep.status}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* General */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            General
          </p>
          <Field
            label="Label"
            value={name ?? label ?? ''}
            onChange={(v) => update({ name: v, label: v || type })}
            placeholder={typeLabel}
            helper="A friendly name you’ll see on the canvas."
          />
        </div>

        {/* --- Webhook trigger: basic info --- */}
        {type === 'webhook' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-700">
                Webhook
              </p>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                POST
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Webhook is the entry point of your workflow. External systems can call this URL.
            </p>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">Webhook URL</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, 'url')}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copiedKey === 'url' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
              <input
                readOnly
                value={webhookUrl}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900"
              />
              <p className="text-xs text-slate-600">
                Send an HTTP POST request to this URL to trigger the workflow.
              </p>
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {testing ? 'Testing…' : 'Test webhook'}
              </button>
              <p className="text-xs text-slate-600">
                Tip: If your workflow is connected to Telegram, this test should send the message.
              </p>
            </div>

            <Field
              label="Description (optional)"
              value={cfg.description ?? ''}
              onChange={(v) => updateConfig({ description: v })}
              placeholder="e.g. Receives order events"
              helper="Optional context for what this webhook represents."
            />

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">Sample payload</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(samplePayloadText, 'payload')}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copiedKey === 'payload' ? 'Copied' : 'Copy example'}
                </button>
              </div>
              <pre className="overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800">
                {samplePayloadText}
              </pre>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">cURL</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copiedKey === 'curl' ? 'Copied' : 'Copy curl'}
                </button>
              </div>
              <pre className="overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800">
                {curlExample}
              </pre>
            </div>

          </div>
        )}

        {/* --- Schedule: cron --- */}
        {type === 'schedule' && (
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                Configuration
              </p>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => updateConfig({ scheduleMode: 'simple' })}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    (cfg.scheduleMode ?? 'simple') === 'simple'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ scheduleMode: 'advanced' })}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    (cfg.scheduleMode ?? 'simple') === 'advanced'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {(cfg.scheduleMode ?? 'simple') === 'simple' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-800">Frequency</label>
                  <select
                    value={cfg.frequency ?? 'hourly'}
                    onChange={(e) => {
                      const freq = e.target.value;
                      let cron = cfg.cron ?? '';
                      if (freq === 'every5') cron = '*/5 * * * *';
                      if (freq === 'hourly') cron = '0 * * * *';
                      if (freq === 'daily') cron = '0 9 * * *';
                      if (freq === 'weekly') cron = '0 9 * * 1';
                      updateConfig({ frequency: freq, cron });
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="every5">Every 5 minutes</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Mon)</option>
                  </select>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Choose how often this workflow should run.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">Time</label>
                    <input
                      type="time"
                      value={cfg.time ?? '09:00'}
                      onChange={(e) => {
                        const t = e.target.value;
                        const freq = cfg.frequency ?? 'hourly';
                        const [h, m] = t.split(':').map((x) => Number(x));
                        let cron = cfg.cron ?? '';
                        if (freq === 'daily') cron = `${m} ${h} * * *`;
                        if (freq === 'weekly') cron = `${m} ${h} * * 1`;
                        updateConfig({ time: t, cron });
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      Used for daily/weekly schedules.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">Timezone</label>
                    <input
                      value={cfg.timezone ?? 'Local'}
                      onChange={(e) => updateConfig({ timezone: e.target.value })}
                      placeholder="Local"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      MVP: display only (scheduler uses server time).
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {(() => {
                    const freq = cfg.frequency ?? 'hourly';
                    const time = cfg.time ?? '09:00';
                    const { preview, nextRun } = nextRunPreview(freq, time);
                    return (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800">{preview}</p>
                        <p className="text-xs text-slate-600">Next run: {nextRun}</p>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <>
                <Field
                  label="Cron expression"
                  value={cfg.cron ?? ''}
                  onChange={(v) => updateConfig({ cron: v })}
                  placeholder="0 * * * *"
                  helper="Advanced mode. Cron must have 5 fields."
                  hint="Examples: 0 * * * * (hourly), */5 * * * * (every 5 minutes)"
                  error={(validation as Record<string, string | null>).cron ?? null}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success(isValidCron(cfg.cron ?? '') ? 'Cron looks valid' : 'Cron is invalid')}
                    className="inline-flex items-center justify-center rounded-btn border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Validate
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- Email trigger --- */}
        {nodeKind === 'trigger' && type === 'email' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <p className="text-xs text-slate-600">
              MVP note: inbound email trigger is not fully implemented yet. These fields are placeholders.
            </p>
            <Field
              label="From (filter)"
              value={cfg.from ?? ''}
              onChange={(v) => updateConfig({ from: v })}
              placeholder="optional (e.g. billing@company.com)"
              helper="Only trigger when the sender matches."
            />
            <Field
              label="Subject contains"
              value={cfg.subjectFilter ?? ''}
              onChange={(v) => updateConfig({ subjectFilter: v })}
              placeholder="optional (e.g. Invoice)"
              helper="Only trigger when the subject contains this text."
            />
          </div>
        )}

        {/* --- HTTP action --- */}
        {type === 'http' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <p className="text-xs text-slate-600">
              Use this node to call another API or webhook.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700">Method</label>
              <select
                value={cfg.method ?? 'GET'}
                onChange={(e) => updateConfig({ method: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <Field
              label="URL"
              value={cfg.url ?? ''}
              onChange={(v) => updateConfig({ url: v })}
              placeholder="https://api.example.com/..."
              type="url"
              helper="The endpoint to call."
              error={validation.url}
            />
            <Field
              label="Headers (JSON)"
              value={typeof cfg.headers === 'string' ? cfg.headers : (cfg.headers ? JSON.stringify(cfg.headers, null, 2) : '')}
              onChange={(v) => updateConfig({ headers: v })}
              placeholder='{"Authorization": "Bearer ..."}'
              multiline
              helper="Optional JSON object. Example: Authorization header."
              error={validation.headers}
            />
            {(cfg.method === 'POST' || cfg.method === 'PUT' || cfg.method === 'PATCH') && (
              <Field
                label="Body (JSON)"
                value={typeof cfg.body === 'string' ? cfg.body : (cfg.body ? JSON.stringify(cfg.body, null, 2) : '')}
                onChange={(v) => updateConfig({ body: v })}
                placeholder='{"key": "value"}'
                multiline
                helper="JSON payload for the request."
                error={validation.httpBody}
              />
            )}
          </div>
        )}

        {/* --- Email action --- */}
        {nodeKind === 'action' && type === 'email' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <p className="text-xs text-slate-600">
              Testing this workflow may send a real email.
            </p>
            <Field
              label="To"
              value={cfg.to ?? ''}
              onChange={(v) => updateConfig({ to: v })}
              placeholder="user@example.com"
              type="email"
              helper="Recipient email address."
              error={validation.to}
            />
            <Field
              label="Subject"
              value={cfg.subject ?? ''}
              onChange={(v) => updateConfig({ subject: v })}
              placeholder="Subject line (e.g. New webhook event)"
              helper="Subject line of the email."
              error={validation.subject}
            />
            <Field
              label="Body"
              value={cfg.body ?? ''}
              onChange={(v) => updateConfig({ body: v })}
              placeholder="Write your email message…"
              multiline
              helper="Body of the email message."
              error={validation.body}
            />
          </div>
        )}

        {/* --- Telegram --- */}
        {type === 'telegram' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-medium text-slate-700">Bot token</label>
                <button
                  type="button"
                  onClick={() => setShowTelegramToken((v) => !v)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  {showTelegramToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showTelegramToken ? 'text' : 'password'}
                value={cfg.botToken ?? ''}
                onChange={(e) => updateConfig({ botToken: e.target.value })}
                placeholder="123456:ABC-DEF..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-slate-600">Your Telegram bot token from BotFather.</p>
              <p className="mt-1 text-xs text-slate-600">Stored in the workflow definition (MVP).</p>
              {validation.botToken && <p className="mt-1 text-xs text-red-600">{validation.botToken}</p>}
            </div>
            <Field
              label="Chat ID"
              value={cfg.chatId ?? ''}
              onChange={(v) => updateConfig({ chatId: v })}
              placeholder="e.g. -1001234567890"
              helper="The ID of the chat, group, or channel where the message will be sent."
              error={validation.chatId}
            />
            <Field
              label="Text"
              value={cfg.text ?? ''}
              onChange={(v) => updateConfig({ text: v })}
              placeholder="Message text (supports Markdown)"
              multiline
              helper="Write the message to send."
              error={validation.text}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Parse mode</label>
                <select
                  value={cfg.parseMode ?? 'Plain'}
                  onChange={(e) => updateConfig({ parseMode: e.target.value === 'Plain' ? '' : e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="Plain">Plain text</option>
                  <option value="Markdown">Markdown</option>
                  <option value="HTML">HTML</option>
                </select>
                <p className="mt-1 text-xs text-slate-600">How Telegram should parse your message.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Options</label>
                <label className="mt-2 flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={cfg.disableWebPreview === 'true'}
                    onChange={(e) => updateConfig({ disableWebPreview: e.target.checked ? 'true' : '' })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Disable link previews
                </label>
                <p className="mt-1 text-xs text-slate-600">Prevents Telegram from generating website previews.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- DB --- */}
        {type === 'db' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <p className="text-xs text-slate-600">
              This node stores data inside the workflow system.
            </p>
            <Field
              label="What should be saved?"
              value={cfg.mapping ?? cfg.payload ?? ''}
              onChange={(v) => updateConfig({ mapping: v, payload: v })}
              placeholder="Leave empty to save the full payload"
              helper="Choose a field/key from the payload, or leave empty to save everything."
            />
          </div>
        )}

        {/* --- Transform --- */}
        {type === 'transform' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Configuration
            </p>
            <p className="text-xs text-slate-600">
              Use this node to reshape data for the next step.
            </p>
            <Field
              label="Rules / Output template (JSON)"
              value={typeof cfg.mapping === 'string' ? cfg.mapping : (cfg.mapping && typeof cfg.mapping === 'object' ? JSON.stringify(cfg.mapping, null, 2) : '')}
              onChange={(v) => updateConfig({ mapping: v })}
              placeholder='{\n  "message": "$.message"\n}'
              multiline
              helper="Define output fields and map them from previous node data (MVP)."
              error={validation.mapping}
            />
          </div>
        )}

        {/* Manual trigger: no extra config */}
        {type === 'manual' && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Help
            </p>
            <p className="text-xs text-slate-600">
              Runs when you test or run the workflow manually. No extra configuration (MVP).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
