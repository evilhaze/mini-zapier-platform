'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  PauseCircle,
  GitBranch,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type OverviewStats = {
  totalWorkflows: number;
  activeWorkflows: number;
  pausedWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pausedExecutions: number;
  successRate: number; // 0..1
  recentExecutionsCount: number; // last 24h on backend
};

type ExecutionListItem = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  workflow?: { id: string; name: string } | null;
};

function isExecutionsResponse(value: unknown): value is { data: ExecutionListItem[] } {
  if (typeof value !== 'object' || value === null) return false;
  const maybe = value as { data?: unknown };
  return Array.isArray(maybe.data);
}

type Period = '24h' | '7d' | '30d' | 'all';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmtInt(n: number) {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

function fmtPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

function sinceForPeriod(period: Period): Date | null {
  const now = Date.now();
  if (period === '24h') return new Date(now - 24 * 60 * 60 * 1000);
  if (period === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function bucketKey(d: Date, period: Period) {
  if (period === '24h') return `${d.getHours().toString().padStart(2, '0')}:00`;
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

function buildBuckets(period: Period) {
  const now = new Date();
  const keys: string[] = [];
  if (period === '24h') {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(now.getHours() - i);
      keys.push(bucketKey(d, period));
    }
    return keys;
  }
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 14; // fallback
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - i);
    keys.push(bucketKey(d, period));
  }
  return keys;
}

function Sparkline({
  data,
  height = 56,
  stroke = '#ef4444',
}: {
  data: number[];
  height?: number;
  stroke?: string;
}) {
  const width = 180;
  const max = Math.max(1, ...data);
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * (width - 2) + 1;
      const y = height - (v / max) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`${points} ${width},${height} 0,${height}`} fill="url(#spark-fill)" opacity="0.9" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.08"
      />
    </svg>
  );
}

function Donut({
  values,
  colors,
}: {
  values: number[];
  colors: string[];
}) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const r = 34;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={92} height={92} viewBox="0 0 92 92">
      <g transform="translate(46 46)">
        <circle r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        {values.map((v, i) => {
          const len = (v / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i}
              r={r}
              fill="none"
              stroke={colors[i]}
              strokeWidth="10"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform="rotate(-90)"
            />
          );
          offset += len;
          return el;
        })}
        <text textAnchor="middle" dy="0.35em" className="fill-slate-700 text-[10px] font-semibold">
          {Math.round((values[0] / total) * 100)}%
        </text>
      </g>
    </svg>
  );
}

function durationMs(startedAt: string, finishedAt: string | null): number | null {
  if (!finishedAt) return null;
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'neutral',
  right,
  featured,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'neutral' | 'red' | 'emerald' | 'amber' | 'violet';
  right?: React.ReactNode;
  featured?: boolean;
}) {
  const accentMap: Record<string, string> = {
    neutral: 'bg-slate-50 text-slate-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-card-hover dark:border-slate-800/80 dark:bg-slate-950 ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-gradient-to-br from-red-200/30 to-violet-200/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p className={`mt-2 font-semibold tracking-tight text-slate-900 tabular-nums ${featured ? 'text-3xl' : 'text-2xl'}`}>
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-black/5 ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {right && <div className="mt-3">{right}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('24h');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [executions, setExecutions] = useState<ExecutionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [ov, ex] = await Promise.all([
          api<OverviewStats>('/statistics/overview', { cache: 'no-store' }),
          api<unknown>('/executions?limit=200', { cache: 'no-store' }),
        ]);
        const list = Array.isArray(ex) ? (ex as ExecutionListItem[]) : isExecutionsResponse(ex) ? ex.data : [];
        if (!cancelled) {
          setOverview(ov as OverviewStats);
          setExecutions(list);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Failed to load analytics');
          setOverview(null);
          setExecutions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const since = sinceForPeriod(period);
    const items = since
      ? executions.filter((e) => new Date(e.startedAt).getTime() >= since.getTime())
      : executions;
    return items.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [executions, period]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { success: 0, failed: 0, paused: 0, running: 0, pending: 0 };
    for (const e of filtered) map[e.status] = (map[e.status] ?? 0) + 1;
    return map;
  }, [filtered]);

  const periodKpis = useMemo(() => {
    const total = filtered.length;
    const success = filtered.filter((e) => e.status === 'success').length;
    const failed = filtered.filter((e) => e.status === 'failed').length;
    const rate = total > 0 ? success / total : 0;
    return { total, success, failed, rate };
  }, [filtered]);

  const series = useMemo(() => {
    const keys = buildBuckets(period);
    const byKey: Record<string, { total: number; success: number; failed: number }> = {};
    keys.forEach((k) => (byKey[k] = { total: 0, success: 0, failed: 0 }));
    for (const e of filtered) {
      const d = new Date(e.startedAt);
      const k = bucketKey(d, period);
      if (!byKey[k]) continue;
      byKey[k].total += 1;
      if (e.status === 'success') byKey[k].success += 1;
      if (e.status === 'failed') byKey[k].failed += 1;
    }
    return {
      keys,
      total: keys.map((k) => byKey[k].total),
      success: keys.map((k) => byKey[k].success),
      failed: keys.map((k) => byKey[k].failed),
    };
  }, [filtered, period]);

  const topWorkflows = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const e of filtered) {
      const wfId = e.workflowId;
      const name = e.workflow?.name ?? wfId;
      const cur = map.get(wfId) ?? { id: wfId, name, count: 0 };
      cur.count += 1;
      map.set(wfId, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filtered]);

  const maxTop = Math.max(1, ...topWorkflows.map((w) => w.count));

  return (
    <div className="relative space-y-10">
      {/* Subtle page accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-red-200/25 blur-3xl" />
        <div className="absolute -right-48 top-10 h-[560px] w-[560px] rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute left-1/3 -bottom-52 h-[520px] w-[520px] rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

      <header className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Workflow analytics
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A dashboard view of reliability and activity across your automations.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
            {(['24h', '7d', '30d', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  period === p
                    ? 'bg-red-600 text-white shadow-soft'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={`Executions (${period.toUpperCase()})`}
          value={loading ? '—' : fmtInt(periodKpis.total)}
          subtitle="Runs in selected period"
          icon={Clock}
          accent="violet"
          featured
          right={<Sparkline data={series.total} stroke="#8b5cf6" height={64} />}
        />
        <KpiCard
          title="Success rate"
          value={loading ? '—' : fmtPct(periodKpis.rate)}
          subtitle="In selected period"
          icon={Activity}
          accent="emerald"
          featured
          right={<Sparkline data={series.success.map((s, i) => (s + series.failed[i] ? s / (s + series.failed[i]) : 0))} stroke="#059669" height={64} />}
        />
        <KpiCard title="Total workflows" value={overview ? fmtInt(overview.totalWorkflows) : loading ? '—' : '0'} icon={GitBranch} />
        <KpiCard title="Active workflows" value={overview ? fmtInt(overview.activeWorkflows) : loading ? '—' : '0'} icon={Activity} accent="emerald" />
        <KpiCard title="Paused workflows" value={overview ? fmtInt(overview.pausedWorkflows) : loading ? '—' : '0'} icon={PauseCircle} accent="amber" />
        <KpiCard title="Total executions" value={overview ? fmtInt(overview.totalExecutions) : loading ? '—' : '0'} icon={BarChart3} />

        <KpiCard
          title="Successful"
          value={loading ? '—' : fmtInt(periodKpis.success)}
          subtitle="In selected period"
          icon={CheckCircle2}
          accent="emerald"
          right={<Sparkline data={series.success} stroke="#059669" height={56} />}
        />
        <KpiCard
          title="Failed"
          value={loading ? '—' : fmtInt(periodKpis.failed)}
          subtitle="In selected period"
          icon={XCircle}
          accent="red"
          right={<Sparkline data={series.failed} stroke="#ef4444" height={56} />}
        />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-card-hover transition-shadow dark:border-slate-800/80 dark:bg-slate-950/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Executions over time
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Total runs in the selected period.
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[560px]">
              <Sparkline data={series.total} height={90} stroke="#ef4444" />
              <div className="mt-3 grid grid-cols-6 gap-2 text-[11px] text-slate-500">
                {series.keys.slice(0, 6).map((k) => (
                  <span key={k} className="truncate">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-card-hover transition-shadow dark:border-slate-800/80 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Status breakdown
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Distribution in selected period.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Donut
              values={[
                statusCounts.success ?? 0,
                statusCounts.failed ?? 0,
                (statusCounts.running ?? 0) + (statusCounts.pending ?? 0),
              ]}
              colors={['#059669', '#ef4444', '#94a3b8']}
            />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">Success</span>
                <span className="font-semibold text-slate-900 tabular-nums">{fmtInt(statusCounts.success ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">Failed</span>
                <span className="font-semibold text-slate-900 tabular-nums">{fmtInt(statusCounts.failed ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">Pending/Running</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {fmtInt((statusCounts.running ?? 0) + (statusCounts.pending ?? 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top workflows + recent executions */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-card-hover transition-shadow dark:border-slate-800/80 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Top workflows
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Most active workflows in selected period.
          </p>
          <div className="mt-4 space-y-3">
            {topWorkflows.length === 0 && (
              <p className="text-sm text-slate-500">No executions in this period.</p>
            )}
            {topWorkflows.map((w) => (
              <div key={w.id} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-slate-800">{w.name}</span>
                  <span className="shrink-0 font-semibold text-slate-900 tabular-nums">{w.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-red-500/70"
                    style={{ width: `${clamp((w.count / maxTop) * 100, 4, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-card-hover transition-shadow dark:border-slate-800/80 dark:bg-slate-950/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Recent executions
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Latest runs (click to open execution).
              </p>
            </div>
            <Link
              href="/executions"
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-xs text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">Workflow</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 pr-4 font-semibold">Trigger</th>
                  <th className="py-2.5 pr-4 font-semibold">Time</th>
                  <th className="py-2.5 pr-4 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>
                      No executions in this period.
                    </td>
                  </tr>
                )}
                {filtered.slice(0, 12).map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer"
                    onClick={() => router.push(`/executions/${e.id}`)}
                  >
                    <td className="py-3 pr-4">
                      <div className="max-w-[320px] truncate font-medium text-slate-900">
                        {e.workflow?.name ?? e.workflowId}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {e.id.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          e.status === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : e.status === 'failed'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{e.triggerType}</td>
                    <td className="py-3 pr-4 text-slate-600 tabular-nums">
                      {new Date(e.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 tabular-nums">
                      {fmtDuration(durationMs(e.startedAt, e.finishedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

