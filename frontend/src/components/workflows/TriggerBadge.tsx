'use client';

const labels: Record<string, string> = {
  webhook: 'Webhook',
  schedule: 'Schedule',
  manual: 'Manual',
  email: 'Email',
  '—': '—',
};

const styles: Record<string, string> = {
  webhook: 'bg-violet-100 text-violet-800',
  schedule: 'bg-blue-100 text-blue-800',
  manual: 'bg-slate-100 text-slate-700',
  email: 'bg-amber-100 text-amber-800',
  '—': 'bg-slate-100 text-slate-500',
};

export function TriggerBadge({ trigger }: { trigger: string }) {
  const key = trigger?.toLowerCase() || '—';
  const label = labels[key] ?? (trigger || '—');
  const className = styles[key] ?? styles['—'];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
