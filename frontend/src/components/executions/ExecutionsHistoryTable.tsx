'use client';

import Link from 'next/link';
import { TriggerBadge } from '@/components/workflows/TriggerBadge';
import { ExecutionStatusBadge } from '@/components/executions/ExecutionStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListChecks, ChevronRight } from 'lucide-react';

export type ExecutionRow = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  workflow?: { id: string; name: string } | null;
};

function formatDate(s: string): string {
  return new Date(s).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

export function ExecutionsHistoryTable({ executions }: { executions: ExecutionRow[] }) {
  if (executions.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks className="h-6 w-6" />}
        title="No executions yet"
        description="Run a workflow to see execution history here. You can also adjust filters to find specific runs."
        action={
          <Link
            href="/workflows"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            View workflows
          </Link>
        }
        compact
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-slate-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80" role="table">
          <thead>
            <tr className="bg-slate-50/90">
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Workflow
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Trigger
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Started
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Finished
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Duration
              </th>
              <th scope="col" className="relative px-5 py-3.5">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
        <tbody className="divide-y divide-slate-200/80 bg-white">
          {executions.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="whitespace-nowrap px-5 py-3.5">
                  <Link
                    href={`/workflows/${e.workflowId}`}
                    className="font-medium text-slate-900 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded"
                  >
                    {e.workflow?.name ?? e.workflowId}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <TriggerBadge trigger={e.triggerType} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <ExecutionStatusBadge status={e.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600 tabular-nums">
                  {formatDate(e.startedAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600 tabular-nums">
                  {e.finishedAt ? formatDate(e.finishedAt) : '—'}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-mono text-slate-600">
                  {formatDuration(e.startedAt, e.finishedAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <Link
                    href={`/executions/${e.id}`}
                    className="inline-flex items-center gap-1 rounded-btn border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-soft hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    aria-label={`View execution ${e.id}`}
                  >
                    Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
