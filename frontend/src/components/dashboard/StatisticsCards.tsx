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
  suffix?: string;
  accent?: boolean;
}[] = [
  { key: 'totalWorkflows', label: 'Total workflows' },
  { key: 'activeWorkflows', label: 'Active' },
  { key: 'pausedWorkflows', label: 'Paused' },
  { key: 'totalExecutions', label: 'Total executions' },
  { key: 'successfulExecutions', label: 'Successful' },
  { key: 'failedExecutions', label: 'Failed' },
  { key: 'pausedExecutions', label: 'Paused (executions)' },
  { key: 'successRate', label: 'Success rate', suffix: '%', accent: true },
  { key: 'recentExecutionsCount', label: 'Last 24h' },
];

export function StatisticsCards({ stats }: { stats: OverviewStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map(({ key, label, suffix = '', accent }) => {
        const value = stats[key];
        const display =
          typeof value === 'number' && key === 'successRate'
            ? (value * 100).toFixed(1)
            : String(value);
        return (
          <div
            key={key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                accent ? 'text-accent' : 'text-slate-900'
              }`}
            >
              {display}
              {suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
