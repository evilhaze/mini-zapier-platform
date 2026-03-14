'use client';

type Status = 'draft' | 'active' | 'archived' | 'pending' | 'running' | 'success' | 'failed' | 'paused' | 'queued';

const styles: Record<Status, string> = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-100 text-amber-800',
  running: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-amber-100 text-amber-800',
  queued: 'bg-slate-100 text-slate-600',
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status?.toLowerCase() || 'draft') as Status;
  const className = styles[s] ?? styles.draft;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
      role="status"
    >
      {status}
    </span>
  );
}
