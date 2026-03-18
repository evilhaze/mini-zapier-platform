import Link from 'next/link';
import { GitBranch, Sparkles } from 'lucide-react';

export function LandingCtaBands() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-red-100 bg-gradient-to-r from-[#FEF2F2] via-white to-[#FEF2F2] px-6 py-8 text-center shadow-sm sm:px-10">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Start building in minutes</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connect a trigger, add actions, and watch your first executions appear with logs you can trust.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <GitBranch className="h-4 w-4" aria-hidden />
            Try demo
          </Link>
          <a
            href="#templates"
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:border-red-200 hover:text-red-700 hover:shadow-card-hover transition-colors"
          >
            Explore templates
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-slate-900">Build with AI assistance</p>
            </div>
            <p className="text-sm text-slate-600">
              Describe your automation in plain language. Get a suggested workflow draft you can refine visually.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#ai"
              className="inline-flex items-center gap-2 rounded-btn bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-slate-800 transition-colors"
            >
              See AI assistant
            </a>
            <Link
              href="/workflows"
              className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:border-red-200 hover:text-red-700 hover:shadow-card-hover transition-colors"
            >
              Browse workflows
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

