'use client';

import { CheckCircle2, XCircle, Loader2, Clock, Pause } from 'lucide-react';

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  success: {
    label: 'Success',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/60',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/60',
    icon: XCircle,
  },
  running: {
    label: 'Running',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/60',
    icon: Loader2,
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/35 dark:text-amber-200 dark:border-amber-900/60',
    icon: Clock,
  },
  paused: {
    label: 'Paused',
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/80',
    icon: Pause,
  },
  queued: {
    label: 'Queued',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/80',
    icon: Clock,
  },
};

export function ExecutionStatusBadge({ status }: { status: string }) {
  const key = (status || '').toLowerCase();
  const config = statusConfig[key] ?? {
    label: status || 'Unknown',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/80',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${config.className}`}
      role="status"
    >
      {key === 'running' ? (
        <Icon className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5 shrink-0" />
      )}
      {config.label}
    </span>
  );
}
