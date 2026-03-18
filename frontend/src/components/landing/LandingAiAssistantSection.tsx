import { ArrowRight, LayoutDashboard, PenLine, Sparkles, Zap } from 'lucide-react';

export function LandingAiAssistantSection() {
  return (
    <section id="ai" className="scroll-mt-24 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">AI assistant</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Build workflows with AI
          </h2>
          <p className="text-sm text-slate-600">
            Describe your automation in plain language. Zyper will generate a workflow draft with recommended
            triggers and actions, so you can refine it visually in the editor.
          </p>
        </div>

        <div className="w-full lg:max-w-md rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">Mini demo</p>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Your prompt</p>
              <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800 font-medium">
                &quot;When a webhook is received, save data to database and send a Telegram alert&quot;
              </pre>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-slate-400" aria-hidden />
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Suggested workflow
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Webhook
                </span>
                <span className="text-slate-500">→</span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Database
                </span>
                <span className="text-slate-500">→</span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  Telegram
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <PenLine className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">Describe what you want to automate</p>
          </div>
          <p className="text-sm text-slate-600">Use simple text and let AI translate it into a workflow plan.</p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">Get a workflow draft</p>
          </div>
          <p className="text-sm text-slate-600">Receive suggested triggers, actions and wiring for your use case.</p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">Refine it visually in the editor</p>
          </div>
          <p className="text-sm text-slate-600">
            Adjust nodes, inputs and outputs on the canvas—without leaving the flow.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-slate-900">Launch faster with fewer manual steps</p>
          </div>
          <p className="text-sm text-slate-600">
            Start with AI recommendations and iterate quickly until it&apos;s production-ready.
          </p>
        </div>
      </div>
    </section>
  );
}

