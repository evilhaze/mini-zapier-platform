import Link from 'next/link';
import { AIGenerateBlock } from '@/components/home/AIGenerateBlock';
import { GitBranch, LayoutDashboard } from 'lucide-react';

export default async function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero / main CTA */}
      <section className="rounded-2xl border border-red-100 bg-rose-50/60 px-6 py-6 shadow-sm sm:px-8 sm:py-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500">
            Welcome to Zyper
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            What would you like to automate?
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Design workflows that connect your apps, move data, and run reliably in the background.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/workflows?create=1"
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              Create workflow
            </Link>
            <Link
              href="/workflows"
              className="inline-flex items-center gap-2 rounded-btn border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-rose-50 dark:border-red-800 dark:bg-slate-950 dark:text-red-200 dark:hover:bg-slate-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              View workflows
            </Link>
          </div>
        </div>

        <div className="mt-6 grid w-full max-w-md gap-3 rounded-xl border border-red-100 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-200 lg:mt-0">
          <div className="flex items-start gap-3 rounded-lg bg-rose-50 px-3 py-2.5">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" aria-hidden />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">Monitor executions in real time</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                See runs, status and logs for every workflow execution.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">Start with a trigger</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Webhooks, schedules or manual runs — then chain actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI workflow generator */}
      <AIGenerateBlock />

      {/* Recommended / starter templates */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Quick start</h2>
            <p className="mt-1 text-xs text-slate-500">
              Use a starter workflow and customize it in the editor.
            </p>
          </div>
          <Link
            href="/workflows"
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            View all workflows
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href="/workflows?create=1&template=webhook-to-http"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Recommended
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Forward webhook to HTTP endpoint
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Receive a webhook, transform payload and call an external API.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-red-600">
                Webhook
              </span>
              <span>→</span>
              <span className="rounded-full bg-slate-50 px-2 py-0.5">
                HTTP request
              </span>
            </div>
          </Link>

          <Link
            href="/workflows?create=1&template=schedule-report"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Time based
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Run a scheduled report
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Use a cron schedule to generate and send a daily summary.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-red-600">
                Schedule
              </span>
              <span>→</span>
              <span className="rounded-full bg-slate-50 px-2 py-0.5">
                Email
              </span>
            </div>
          </Link>

          <Link
            href="/workflows?create=1&template=manual-test"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                For testing
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Manual test workflow
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Trigger runs manually while building and debugging your logic.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-red-600">
                Manual
              </span>
              <span>→</span>
              <span className="rounded-full bg-slate-50 px-2 py-0.5">
                Any actions
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

