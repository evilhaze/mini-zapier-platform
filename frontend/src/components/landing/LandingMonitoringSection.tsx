import { CheckCircle2, XCircle } from 'lucide-react';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';

export function LandingMonitoringSection() {
  const stats = {
    totalWorkflows: 1240,
    activeWorkflows: 86,
    pausedWorkflows: 14,
    totalExecutions: 9821,
    successfulExecutions: 9562,
    failedExecutions: 259,
    pausedExecutions: 12,
    successRate: 0.9737,
    recentExecutionsCount: 243,
  };

  return (
    <section
      id="monitoring"
      className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center"
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Observability built‑in</p>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          See every execution, log and payload — without leaving Zyper.
        </h2>
        <p className="text-sm text-slate-600">
          Execution history, step‑level logs and payload views help you understand what happened in each run.
          Debug failures quickly and ship automations you can trust.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
          <li>• Filter runs by status, workflow or trigger.</li>
          <li>• Inspect inputs and outputs for any step.</li>
          <li>• Spot trends and regressions across executions.</li>
        </ul>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">KPI</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Execution visibility</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
            Last 24 hours
          </span>
        </div>

        <StatisticsCards stats={stats} />

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Recent runs</p>
            <p className="text-xs font-medium text-slate-500">5 examples</p>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800">Webhook → DB → Telegram</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Customer signup workflow</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Success
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-500">153ms</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium text-slate-800">Schedule → Email report</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Weekly digest</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                  <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
                  Running
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-500">3.4s</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-slate-800">Email trigger → HTTP</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Support alerts</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                  <XCircle className="h-3.5 w-3.5" aria-hidden />
                  Failed
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-500">timeout</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-slate-800">Webhook → Transform → DB</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Data pipeline</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Success
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-500">287ms</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium text-slate-800">Schedule → Transform → HTTP</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">CRM sync</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                  Paused
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-500">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

