'use client';

export type OverviewStats = {
  totalWorkflows: number;
  activeWorkflows: number;
  pausedWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pausedExecutions: number;
  successRate: number;
  recentExecutionsCount: number;
};

const cards: {
  key: keyof OverviewStats;
  label: string;
  subtitle?: string;
  suffix?: string;
  accent?: boolean;
}[] = [
  { key: 'totalWorkflows', label: 'Total workflows' },
  { key: 'activeWorkflows', label: 'Active', subtitle: 'workflows' },
  { key: 'pausedWorkflows', label: 'Paused', subtitle: 'workflows' },
  { key: 'totalExecutions', label: 'Total executions' },
  { key: 'successfulExecutions', label: 'Successful', subtitle: 'executions' },
  { key: 'failedExecutions', label: 'Failed', subtitle: 'executions' },
  { key: 'pausedExecutions', label: 'Paused', subtitle: 'executions' },
  { key: 'successRate', label: 'Success rate', subtitle: 'of all runs', suffix: '%', accent: true },
  { key: 'recentExecutionsCount', label: 'Last 24h', subtitle: 'executions' },
];

function formatValue(value: number, key: string): string {
  if (key === 'successRate') return (value * 100).toFixed(1);
  return value >= 1000 ? value.toLocaleString() : String(value);
}

export function StatisticsCards({ stats }: { stats: OverviewStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, label, subtitle, suffix = '', accent }) => {
        const value = stats[key];
        const display = typeof value === 'number' ? formatValue(value, key) : String(value);
        return (
          <div
            key={key}
            className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-card ${
              accent
                ? 'border-accent/20'
                : 'border-slate-200/80'
            }`}
          >
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p
                className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${
                  accent ? 'text-accent' : 'text-slate-900'
                }`}
              >
                {display}
                {suffix}
              </p>
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
