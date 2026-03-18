import { ClipboardList, PlugZap, TestTube, WandSparkles } from 'lucide-react';

export function LandingHowItWorks() {
  return (
    <section className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">How it works</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Build a workflow in four clean steps
          </h2>
          <p className="text-sm text-slate-600">
            Pick a trigger, add actions, test it with real payloads, then monitor every execution with logs.
          </p>
        </div>
      </div>

      <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <li className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              1
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100/60 text-red-600">
              <PlugZap className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Choose a trigger</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Start from webhook, schedule or email—anything that can send data into Zyper.
          </p>
        </li>

        <li className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              2
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100/60 text-violet-600">
              <ClipboardList className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Add actions</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Connect HTTP requests, databases, transforms and notifications with visual wiring.
          </p>
        </li>

        <li className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              3
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100/60 text-emerald-600">
              <TestTube className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Test the workflow</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Run it on real payloads, validate outputs, and refine the flow before you ship.
          </p>
        </li>

        <li className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 font-semibold text-sm">
              4
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100/60 text-sky-600">
              <WandSparkles className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Monitor executions</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Observe logs and payloads for every step—so failures are obvious and fast to fix.
          </p>
        </li>
      </ol>
    </section>
  );
}

