'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'webhook' | 'schedule' | 'manual'>('webhook');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const nodeId = 'trigger-1';
    const definitionJson = {
      nodes: [
        { id: nodeId, type: triggerType, config: triggerType === 'schedule' ? { cron: '0 * * * *' } : {}, name: `${triggerType} trigger` },
      ],
      edges: [],
    };
    try {
      const res = await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          status: 'draft',
          isPaused: false,
          definitionJson,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      router.replace(`/editor/${(data as { id: string }).id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Workflows
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-900">New workflow</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a name and trigger type. You can edit the graph in the editor next.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Order to Slack"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="trigger" className="block text-sm font-medium text-slate-700">
              Trigger
            </label>
            <select
              id="trigger"
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as 'webhook' | 'schedule' | 'manual')}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="webhook">Webhook</option>
              <option value="schedule">Schedule (cron)</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create & open editor
            </button>
            <Link
              href="/workflows"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
