import Link from 'next/link';
import { ArrowRight, GitBranch } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
          Visual automation for modern teams
        </p>
        <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Design, run and monitor automations with Zyper.
        </h1>
        <p className="max-w-xl text-sm text-slate-600 sm:text-base">
          Build workflows from triggers, actions and executions in a canvas made for automation. Connect
          webhooks, schedules, email, HTTP and messaging — with full history and logs for every run.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            Try demo
          </Link>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:border-red-200 hover:text-red-700 hover:shadow-card-hover transition-colors"
          >
            View templates
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:border-red-200 hover:text-red-700 hover:shadow-card-hover transition-colors"
          >
            Integrations
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          No credit card required · Start with webhooks, schedules, email and HTTP.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Fast builds</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">Minutes</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Reliable runs</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">99.9%</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI drafts</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">In seconds</p>
          </div>
        </div>
      </div>

      {/* Product mockup */}
      <div className="relative lg:justify-self-end">
        <div className="pointer-events-none absolute inset-0 -translate-y-4 rounded-[2.5rem] bg-gradient-to-tr from-red-100 via-rose-50 to-slate-50 opacity-80 blur-2xl" />
        <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl lg:max-w-lg">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600 text-xs font-semibold text-white">
                Z
              </span>
              <span className="text-sm font-semibold text-slate-900 truncate">Customer signup workflow</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Live
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
              Workflow: Webhook → Database → Telegram
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Verified execution logs
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* Sidebar mock */}
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Triggers</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center">
                    WH
                  </span>
                  <span className="truncate">Webhook</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center">
                    CR
                  </span>
                  <span className="truncate">Schedule</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center">
                    EM
                  </span>
                  <span className="truncate">Email trigger</span>
                </div>
              </div>

              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                    HTTP
                  </span>
                  <span className="truncate">HTTP request</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                    DB
                  </span>
                  <span className="truncate">Database</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-slate-700">
                  <span className="h-6 w-6 rounded-md bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                    FX
                  </span>
                  <span className="truncate">Transform</span>
                </div>
              </div>
            </div>

            {/* Canvas mock */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.12),transparent_60%),radial-gradient(circle_at_bottom,_rgba(239,68,68,0.1),transparent_55%)]" />
              <div className="relative space-y-4">
                <div className="mx-auto w-full max-w-md rounded-card border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trigger</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Incoming webhook</p>
                      <p className="mt-1 text-xs text-slate-500">Receive JSON payloads from your app.</p>
                    </div>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                      Listening
                    </span>
                  </div>
                </div>

                <div className="mx-auto w-px flex-1 bg-gradient-to-b from-slate-300/80 to-slate-200/30" />

                <div className="mx-auto w-full max-w-md space-y-3">
                  <div className="rounded-card border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Action</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Store in database</p>
                    <p className="mt-1 text-xs text-slate-500">Insert sanitized rows into your own DB.</p>
                  </div>
                  <div className="rounded-card border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Action</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Send notification</p>
                    <p className="mt-1 text-xs text-slate-500">Alert your team via Telegram or email.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

