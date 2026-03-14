'use client';

import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import type { FlowNodeData } from './utils';
import { NODE_LABELS } from './types';

type Props = {
  node: Node<FlowNodeData> | null;
  onUpdate: (nodeId: string, data: Partial<FlowNodeData>) => void;
};

export function SettingsPanel({ node, onUpdate }: Props) {
  const update = useCallback(
    (patch: Partial<FlowNodeData>) => {
      if (node) onUpdate(node.id, patch);
    },
    [node, onUpdate]
  );

  if (!node) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-l border-slate-200 bg-slate-50/80">
        <div className="border-b border-slate-200 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Settings</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-sm text-slate-500">Select a node to edit its settings</p>
        </div>
      </aside>
    );
  }

  const { type, label, config = {}, name } = node.data;
  const typeLabel = NODE_LABELS[type] ?? type;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-700">Settings</h3>
        <p className="mt-0.5 text-xs text-slate-500">{typeLabel}</p>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Label</label>
          <input
            type="text"
            value={name ?? label ?? ''}
            onChange={(e) => update({ name: e.target.value, label: e.target.value || type })}
            placeholder={typeLabel}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Type-specific config */}
        {type === 'http' && (
          <div>
            <label className="block text-xs font-medium text-slate-600">URL</label>
            <input
              type="url"
              value={(config.url as string) ?? ''}
              onChange={(e) => update({ config: { ...config, url: e.target.value } })}
              placeholder="https://api.example.com"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
        {type === 'schedule' && (
          <div>
            <label className="block text-xs font-medium text-slate-600">Cron expression</label>
            <input
              type="text"
              value={(config.cron as string) ?? ''}
              onChange={(e) => update({ config: { ...config, cron: e.target.value } })}
              placeholder="0 * * * *"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-slate-400">e.g. 0 * * * * = every hour</p>
          </div>
        )}
        {type === 'email' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600">To</label>
              <input
                type="text"
                value={(config.to as string) ?? ''}
                onChange={(e) => update({ config: { ...config, to: e.target.value } })}
                placeholder="user@example.com"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Subject</label>
              <input
                type="text"
                value={(config.subject as string) ?? ''}
                onChange={(e) => update({ config: { ...config, subject: e.target.value } })}
                placeholder="Subject"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </>
        )}
        {type === 'telegram' && (
          <div>
            <label className="block text-xs font-medium text-slate-600">Chat ID / Token</label>
            <input
              type="text"
              value={(config.chatId as string) ?? ''}
              onChange={(e) => update({ config: { ...config, chatId: e.target.value } })}
              placeholder="Chat ID or leave empty"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
        {type === 'transform' && (
          <div>
            <label className="block text-xs font-medium text-slate-600">JSON path / mapping</label>
            <input
              type="text"
              value={(config.mapping as string) ?? ''}
              onChange={(e) => update({ config: { ...config, mapping: e.target.value } })}
              placeholder="e.g. $.data.value"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
        {type === 'db' && (
          <div>
            <label className="block text-xs font-medium text-slate-600">Payload key</label>
            <input
              type="text"
              value={(config.payload as string) ?? ''}
              onChange={(e) => update({ config: { ...config, payload: e.target.value } })}
              placeholder="Leave empty to use input"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
