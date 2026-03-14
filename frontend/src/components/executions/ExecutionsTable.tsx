'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/workflows/StatusBadge';
import { ExternalLink } from 'lucide-react';

export type ExecutionItem = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  workflow?: { id: string; name: string };
};

export function ExecutionsTable({
  executions,
  showWorkflow = true,
}: {
  executions: ExecutionItem[];
  showWorkflow?: boolean;
}) {
  if (executions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        No executions yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-slate-200" role="table">
        <thead>
          <tr className="bg-slate-50/80">
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Execution
            </th>
            {showWorkflow && (
              <th
                scope="col"
                className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Workflow
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Trigger
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Started
            </th>
            <th scope="col" className="relative px-6 py-3.5">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {executions.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50/50">
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-slate-600">
                {e.id.slice(0, 8)}…
              </td>
              {showWorkflow && (
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                  {e.workflow?.name ?? e.workflowId}
                </td>
              )}
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {e.triggerType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={e.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                {new Date(e.startedAt).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <Link
                  href={`/executions/${e.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark"
                  aria-label={`View execution ${e.id}`}
                >
                  View
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
