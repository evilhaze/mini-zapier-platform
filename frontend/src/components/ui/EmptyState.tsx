import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  /** Smaller padding, e.g. inside a card */
  compact?: boolean;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: Props) {
  return (
    <div
      className={`rounded-card border border-slate-200/80 bg-white text-center shadow-card ${
        compact ? 'py-10 px-6' : 'py-16 px-6'
      }`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
