'use client';

import Link from 'next/link';
import { Pencil, PlayCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export type WorkflowItem = {
  id: string;
  name: string;
  status: string;
  isPaused: boolean;
  definitionJson: unknown;
  createdAt: string;
  updatedAt: string;
};

export function WorkflowCard({ w }: { w: WorkflowItem }) {
  const status = w.isPaused ? 'paused' : w.status;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/workflows/${w.id}`}
            className="font-medium text-slate-900 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded"
          >
            {w.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {w.isPaused && (
              <span className="text-xs text-slate-500">Paused</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/editor/${w.id}`}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            title="Edit workflow"
            aria-label={`Edit ${w.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Link
            href={`/workflows/${w.id}`}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-accent"
            title="Open workflow"
            aria-label={`Open ${w.name}`}
          >
            <PlayCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Updated {new Date(w.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
