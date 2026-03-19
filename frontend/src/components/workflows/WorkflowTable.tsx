'use client';

import Link from 'next/link';
import { Pencil, PlayCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { WorkflowItem } from './WorkflowCard';

export function WorkflowTable({ workflows }: { workflows: WorkflowItem[] }) {
  if (workflows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
        No workflows yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-600 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600" role="table">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-700">
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300"
            >
              Updated
            </th>
            <th scope="col" className="relative px-6 py-3.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-600 dark:bg-slate-800">
          {workflows.map((w) => {
            const status = w.isPaused ? 'paused' : w.status;
            return (
              <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/workflows/${w.id}`}
                    className="font-medium text-slate-900 hover:text-accent dark:text-slate-50"
                  >
                    {w.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {new Date(w.updatedAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/editor/${w.id}`}
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
                      title="Edit"
                      aria-label={`Edit ${w.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/workflows/${w.id}`}
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-accent dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-accent"
                      title="Open"
                      aria-label={`Open ${w.name}`}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
