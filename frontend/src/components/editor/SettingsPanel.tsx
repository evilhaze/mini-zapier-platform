'use client';

import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import type { FlowNodeData } from './utils';
import { NODE_LABELS } from './types';

type Props = {
  node: Node<FlowNodeData> | null;
  onUpdate: (nodeId: string, data: Partial<FlowNodeData>) => void;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
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
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function SettingsPanel({ node, onUpdate }: Props) {
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

  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-slate-50/80">
        <div className="border-b border-slate-200 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Node settings</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-sm text-slate-500">Select a node to edit its settings</p>
        </div>
      </aside>
    );
  }

  const { type, label, config = {}, name } = node.data;
  const nodeKind = node.type as string; // 'trigger' | 'action'
  const typeLabel = NODE_LABELS[type] ?? type;

  const cfg = config as Record<string, string | undefined>;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-700">Node settings</h3>
        <p className="mt-0.5 text-xs text-slate-500">{typeLabel}</p>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Common: label */}
        <div>
          <Field
            label="Label"
            value={name ?? label ?? ''}
            onChange={(v) => update({ name: v, label: v || type })}
            placeholder={typeLabel}
          />
        </div>

        {/* --- Webhook trigger: basic info --- */}
        {type === 'webhook' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Webhook
            </p>
            <Field
              label="Description (optional)"
              value={cfg.description ?? ''}
              onChange={(v) => updateConfig({ description: v })}
              placeholder="e.g. Receives order events"
            />
          </div>
        )}

        {/* --- Schedule: cron --- */}
        {type === 'schedule' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Schedule
            </p>
            <Field
              label="Cron expression"
              value={cfg.cron ?? ''}
              onChange={(v) => updateConfig({ cron: v })}
              placeholder="0 * * * *"
              hint="e.g. 0 * * * * = every hour, */5 * * * * = every 5 min"
            />
          </div>
        )}

        {/* --- Email trigger --- */}
        {nodeKind === 'trigger' && type === 'email' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Expected email
            </p>
            <Field
              label="From (filter)"
              value={cfg.from ?? ''}
              onChange={(v) => updateConfig({ from: v })}
              placeholder="optional"
            />
            <Field
              label="Subject contains"
              value={cfg.subjectFilter ?? ''}
              onChange={(v) => updateConfig({ subjectFilter: v })}
              placeholder="optional"
            />
          </div>
        )}

        {/* --- HTTP action --- */}
        {type === 'http' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Request
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-600">Method</label>
              <select
                value={cfg.method ?? 'GET'}
                onChange={(e) => updateConfig({ method: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            />
            <Field
              label="Headers (JSON)"
              value={typeof cfg.headers === 'string' ? cfg.headers : (cfg.headers ? JSON.stringify(cfg.headers, null, 2) : '')}
              onChange={(v) => updateConfig({ headers: v })}
              placeholder='{"Authorization": "Bearer ..."}'
              multiline
              hint="Optional JSON object"
            />
            {(cfg.method === 'POST' || cfg.method === 'PUT' || cfg.method === 'PATCH') && (
              <Field
                label="Body (JSON)"
                value={typeof cfg.body === 'string' ? cfg.body : (cfg.body ? JSON.stringify(cfg.body, null, 2) : '')}
                onChange={(v) => updateConfig({ body: v })}
                placeholder='{"key": "value"}'
                multiline
              />
            )}
          </div>
        )}

        {/* --- Email action --- */}
        {nodeKind === 'action' && type === 'email' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Email
            </p>
            <Field
              label="To"
              value={cfg.to ?? ''}
              onChange={(v) => updateConfig({ to: v })}
              placeholder="user@example.com"
              type="email"
            />
            <Field
              label="Subject"
              value={cfg.subject ?? ''}
              onChange={(v) => updateConfig({ subject: v })}
              placeholder="Subject line"
            />
            <Field
              label="Body"
              value={cfg.body ?? ''}
              onChange={(v) => updateConfig({ body: v })}
              placeholder="Plain text or HTML"
              multiline
            />
          </div>
        )}

        {/* --- Telegram --- */}
        {type === 'telegram' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Telegram
            </p>
            <Field
              label="Bot token"
              value={cfg.botToken ?? ''}
              onChange={(v) => updateConfig({ botToken: v })}
              placeholder="123456:ABC-DEF..."
              type="password"
              hint="Stored in node; use env in production"
            />
            <Field
              label="Chat ID"
              value={cfg.chatId ?? ''}
              onChange={(v) => updateConfig({ chatId: v })}
              placeholder="e.g. -1001234567890"
            />
            <Field
              label="Text"
              value={cfg.text ?? ''}
              onChange={(v) => updateConfig({ text: v })}
              placeholder="Message text (supports Markdown)"
              multiline
            />
          </div>
        )}

        {/* --- DB --- */}
        {type === 'db' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Database
            </p>
            <Field
              label="Mapping (JSON path or key)"
              value={cfg.mapping ?? cfg.payload ?? ''}
              onChange={(v) => updateConfig({ mapping: v, payload: v })}
              placeholder="Leave empty to save full input"
              hint="Key/path for the payload to store"
            />
          </div>
        )}

        {/* --- Transform --- */}
        {type === 'transform' && (
          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Mapping rules
            </p>
            <Field
              label="Rules (JSON)"
              value={typeof cfg.mapping === 'string' ? cfg.mapping : (cfg.mapping && typeof cfg.mapping === 'object' ? JSON.stringify(cfg.mapping, null, 2) : '')}
              onChange={(v) => updateConfig({ mapping: v })}
              placeholder='{"outKey": "$.input.path"}'
              multiline
              hint="Object: output key → JSON path or value"
            />
          </div>
        )}

        {/* Manual trigger: no extra config */}
        {type === 'manual' && (
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs text-slate-500">Runs when you click Run. No extra config.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
