import { Database, History, LayoutDashboard, PlugZap, Sparkles, Timer, Workflow } from 'lucide-react';

export function LandingCapabilities() {
  return (
    <section id="features" className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Everything you need to ship reliable automations
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Zyper combines a visual editor, powerful triggers and detailed run history in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <details className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card" open>
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-900">Build</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Editor + wiring</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Visual workflow editor</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Drag and connect triggers, actions and branches on a canvas.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Triggers & actions</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Start from webhooks, schedules or email. Chain HTTP, Telegram, DB and transforms.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Webhooks</h3>
                <p className="mt-1 text-sm text-slate-600">Receive payloads and trigger automations instantly.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Schedule triggers</h3>
                <p className="mt-1 text-sm text-slate-600">Run reports on cron-style schedules.</p>
              </div>
            </div>
          </details>

          <details className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Workflow className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-900">Operate</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Logs + reliability</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Execution history</h3>
                <p className="mt-1 text-sm text-slate-600">Inspect inputs, outputs and timing for every run.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Logs & debugging</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Step-by-step logs and error details to debug failures quickly.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Transform & route data</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Normalize payloads, branch by conditions and route to the right destination.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Database</h3>
                <p className="mt-1 text-sm text-slate-600">Store records and keep a reliable run trail.</p>
              </div>
            </div>
          </details>
        </div>

        <div className="space-y-4">
          <details className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card" open>
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-900">AI assistant</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Draft → refine</span>
            </summary>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Describe in plain text</h3>
                <p className="mt-1 text-sm text-slate-600">Turn your idea into a workflow proposal.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Recommended triggers & actions</h3>
                <p className="mt-1 text-sm text-slate-600">Get wiring for webhooks, schedule, email and HTTP.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card-hover">
                <h3 className="text-sm font-semibold text-slate-900">Launch faster</h3>
                <p className="mt-1 text-sm text-slate-600">Start with AI recommendations and iterate to production-ready.</p>
              </div>
            </div>
          </details>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <History className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Everything is inspectable</p>
                <p className="mt-1 text-sm text-slate-600">
                  See what ran, what failed and how long it took—step by step.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <PlugZap className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                Webhook → DB
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <Timer className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                Schedule → Report
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <Database className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                Data transform
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

