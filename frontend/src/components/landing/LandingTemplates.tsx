import Link from 'next/link';

export function LandingTemplates() {
  return (
    <section id="templates" className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Templates</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Use cases you can launch today
          </h2>
          <p className="text-sm text-slate-600">
            Start from a starter workflow, then customize nodes, inputs, transforms and destinations in the visual editor.
          </p>
        </div>

        <Link href="/workflows" className="text-sm font-medium text-red-600 hover:text-red-700">
          Browse all workflows
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Use case scenarios</h3>
              <p className="mt-1 text-sm text-slate-600">
                Common automation patterns with one click to create a workflow draft.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/workflows?create=1&template=lead-routing"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Lead notifications</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Route leads automatically</h4>
                <p className="mt-1 text-xs text-slate-600">Enrich and send new leads to the right owner without manual follow-ups.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Webhook → Transform → HTTP / Email</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>

            <Link
              href="/workflows?create=1&template=email-http"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Support alerts</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Turn emails into actions</h4>
                <p className="mt-1 text-xs text-slate-600">React to incoming messages and call your internal APIs or web services.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Email trigger → HTTP request</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>

            <Link
              href="/workflows?create=1&template=schedule-telegram"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Scheduled reports</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Send daily or hourly digests</h4>
                <p className="mt-1 text-xs text-slate-600">Use cron schedules to deliver summaries to your team via Telegram.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Schedule → Transform → Telegram</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>

            <Link
              href="/workflows?create=1&template=webhook-db"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Webhook → API</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Capture events and enrich data</h4>
                <p className="mt-1 text-xs text-slate-600">Receive payloads and store sanitized rows with transforms in-between.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Webhook → Transform → Database</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>

            <Link
              href="/workflows?create=1&template=data-pipeline"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">CRM sync</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Normalize and route your data</h4>
                <p className="mt-1 text-xs text-slate-600">Reshape payloads and send them to warehouses, CRMs or internal tools.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Webhook / Schedule → Transform → DB / HTTP</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>

            <Link
              href="/workflows?create=1&template=email-http"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Form → messages</p>
                <h4 className="mt-2 text-sm font-semibold text-slate-900">Fan out inbox events</h4>
                <p className="mt-1 text-xs text-slate-600">Forward incoming form/email messages to the right API endpoint.</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">Email trigger → HTTP request</p>
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                  Create workflow
                </span>
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-card space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Starter templates</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Ready-to-edit drafts</h3>
            <p className="mt-1 text-sm text-slate-600">
              A quick starting point for common automations. Customize everything on the canvas.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/workflows?create=1&template=webhook-db"
              className="group block rounded-xl border border-slate-200/80 bg-white p-4 hover:border-red-200 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Data</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Webhook to database</p>
              <p className="mt-1 text-xs text-slate-600">Webhook → Transform → Database</p>
            </Link>

            <Link
              href="/workflows?create=1&template=schedule-telegram"
              className="group block rounded-xl border border-slate-200/80 bg-white p-4 hover:border-red-200 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Notifications</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Schedule to Telegram</p>
              <p className="mt-1 text-xs text-slate-600">Schedule → Transform → Telegram</p>
            </Link>

            <Link
              href="/workflows?create=1&template=email-http"
              className="group block rounded-xl border border-slate-200/80 bg-white p-4 hover:border-red-200 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Inbox automation</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Email trigger to HTTP</p>
              <p className="mt-1 text-xs text-slate-600">Email trigger → HTTP request</p>
            </Link>

            <Link
              href="/workflows?create=1&template=lead-routing"
              className="group block rounded-xl border border-slate-200/80 bg-white p-4 hover:border-red-200 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">GTM</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Lead routing workflow</p>
              <p className="mt-1 text-xs text-slate-600">Webhook → Transform → HTTP / Email</p>
            </Link>

            <Link
              href="/workflows?create=1&template=data-pipeline"
              className="group block rounded-xl border border-slate-200/80 bg-white p-4 hover:border-red-200 transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Data pipeline</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Data transform pipeline</p>
              <p className="mt-1 text-xs text-slate-600">Webhook / Schedule → Transform → DB / HTTP</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

