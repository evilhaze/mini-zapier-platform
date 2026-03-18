import { Activity, CheckCircle2, XCircle } from 'lucide-react';

export function LandingAnalyticsShowcase() {
  const successRate = 97.4;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Dashboard</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            See how your automations perform
          </h2>
          <p className="text-sm text-slate-600">
            Monitor success rate, execution speed and recent runs with clear, production-friendly visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-card">
            <Activity className="h-4 w-4 text-red-500" aria-hidden />
            Last 14 days
          </span>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Success rate</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{successRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Executions over time</p>
            <p className="text-xs font-medium text-slate-500">Mock data</p>
          </div>

          <div className="mt-4 flex items-end gap-2 h-44">
            {[
              18, 22, 30, 26, 34, 41, 38, 44, 49, 43, 52, 57,
              54, 61,
            ].map((v, idx) => (
              <div
                key={idx}
                className="w-full rounded-lg bg-gradient-to-t from-red-500/80 to-red-50 border border-red-100"
                style={{ height: `${Math.max(18, v)}%` }}
                aria-hidden
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>2w ago</span>
            <span>Now</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Recent executions</p>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                6 runs
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <RunRow
                title="Webhook → DB → Telegram"
                subtitle="Customer signup workflow"
                status="Success"
                time="153ms"
                variant="success"
              />
              <RunRow
                title="Schedule → Email report"
                subtitle="Weekly digest"
                status="Running"
                time="3.4s"
                variant="running"
              />
              <RunRow
                title="Email trigger → HTTP"
                subtitle="Support alerts"
                status="Failed"
                time="timeout"
                variant="failed"
              />
              <RunRow
                title="Webhook → Transform → DB"
                subtitle="Data pipeline"
                status="Success"
                time="287ms"
                variant="success"
              />
              <RunRow
                title="Schedule → Transform → HTTP"
                subtitle="CRM sync"
                status="Paused"
                time="—"
                variant="paused"
              />
              <RunRow
                title="Webhook → HTTP → Telegram"
                subtitle="Ops alerts"
                status="Success"
                time="221ms"
                variant="success"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-slate-900">What you learn from logs</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Which step slowed down (timings per node)</li>
              <li>• What payload failed (payload snapshots)</li>
              <li>• Why retries happened (error details)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function RunRow({
  title,
  subtitle,
  status,
  time,
  variant,
}: {
  title: string;
  subtitle: string;
  status: string;
  time: string;
  variant: 'success' | 'failed' | 'running' | 'paused';
}) {
  const pill =
    variant === 'success'
      ? {
          className: 'bg-emerald-50 text-emerald-700',
          icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
        }
      : variant === 'failed'
        ? {
            className: 'bg-red-50 text-red-700',
            icon: <XCircle className="h-3.5 w-3.5" aria-hidden />,
          }
        : variant === 'running'
          ? {
              className: 'bg-sky-50 text-sky-700',
              icon: <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />,
            }
          : {
              className: 'bg-slate-50 text-slate-700',
              icon: <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />,
            };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pill.className}`}>
          {pill.icon}
          {status}
        </span>
        <p className="mt-1 font-mono text-[11px] text-slate-500">{time}</p>
      </div>
    </div>
  );
}

