import Link from 'next/link';
import { Lock, PlugZap, Sparkles } from 'lucide-react';
import { Reveal } from './Reveal';

const INTEGRATIONS = [
  { name: 'Google Sheets', subtitle: 'Spreadsheets', popular: true },
  { name: 'Notion', subtitle: 'Docs & databases', popular: true },
  { name: 'Slack', subtitle: 'Team messaging', popular: true },
  { name: 'GitHub', subtitle: 'Issues & code', popular: false },
  { name: 'Gmail', subtitle: 'Email inbox', popular: false },
  { name: 'Stripe', subtitle: 'Payments', popular: false },
  { name: 'OpenAI', subtitle: 'AI models', popular: false },
  { name: 'Discord', subtitle: 'Communities', popular: false },
];

export function LandingIntegrationsShowcase() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Integrations</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Connect your favorite services
          </h2>
          <p className="text-sm text-slate-600">
            Popular integrations are coming soon. Preview what you will be able to automate in your workflows.
          </p>
        </div>

        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:border-red-200 hover:text-red-700 hover:shadow-card-hover transition-colors"
        >
          Explore all
          <PlugZap className="h-4 w-4 text-red-500" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INTEGRATIONS.map((item, idx) => (
          <Reveal key={item.name} delayMs={idx * 80} className="w-full">
            <Link
              href="/integrations"
              className="group relative flex h-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition hover:shadow-card-hover"
            >
              {item.popular ? (
                <span className="pointer-events-none absolute -top-3 left-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold text-red-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Coming soon
                </span>
              ) : (
                <span className="pointer-events-none inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 self-start">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Locked
                </span>
              )}

              <div className="mt-2">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-600">{item.subtitle}</p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  Preview actions
                </span>
                <span
                  aria-hidden
                  className="h-10 w-10 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.35),transparent_55%)] opacity-80"
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

