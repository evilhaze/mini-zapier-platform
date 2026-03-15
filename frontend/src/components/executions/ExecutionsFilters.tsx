'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type WorkflowOption = { id: string; name: string };

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
  { value: 'paused', label: 'Paused' },
];

type Props = {
  workflows: WorkflowOption[];
};

export function ExecutionsFilters({ workflows }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const workflowId = searchParams.get('workflowId') ?? '';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/executions?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="exec-status" className="text-sm font-medium text-slate-600">
          Status
        </label>
        <select
          id="exec-status"
          value={status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="exec-workflow" className="text-sm font-medium text-slate-600">
          Workflow
        </label>
        <select
          id="exec-workflow"
          value={workflowId}
          onChange={(e) => setFilter('workflowId', e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-w-[180px]"
        >
          <option value="">All workflows</option>
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      {(status || workflowId) && (
        <button
          type="button"
          onClick={() => router.push('/executions', { scroll: false })}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
