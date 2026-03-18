import Link from 'next/link';
import { Activity, ArrowRight, GitBranch, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { LandingAiAssistantSection } from '@/components/landing/LandingAiAssistantSection';
import { LandingAnalyticsShowcase } from '@/components/landing/LandingAnalyticsShowcase';
import { LandingCapabilities } from '@/components/landing/LandingCapabilities';
import { LandingDeveloperSide } from '@/components/landing/LandingDeveloperSide';
import { LandingFinalCta } from '@/components/landing/LandingFinalCta';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingIntegrationsShowcase } from '@/components/landing/LandingIntegrationsShowcase';
import { LandingMonitoringSection } from '@/components/landing/LandingMonitoringSection';
import { LandingSocialProof } from '@/components/landing/LandingSocialProof';
import { LandingTemplates } from '@/components/landing/LandingTemplates';
import { Reveal } from '@/components/landing/Reveal';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      <LandingBackground />
      <div className="relative z-10">
      {/* Top navbar */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Zyper
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-500 sm:flex">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#templates" className="hover:text-slate-900">
              Templates
            </a>
            <a href="#ai" className="hover:text-slate-900">
              AI assistant
            </a>
            <a href="#monitoring" className="hover:text-slate-900">
              Monitoring
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Sign up
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Try demo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16 space-y-20">
        <Reveal>
          <LandingHero />
        </Reveal>
        <Reveal>
          <LandingSocialProof />
        </Reveal>
        <Reveal>
          <LandingCapabilities />
        </Reveal>
        <Reveal>
          <LandingHowItWorks />
        </Reveal>
        <Reveal>
          <LandingTemplates />
        </Reveal>
        <Reveal>
          <LandingAiAssistantSection />
        </Reveal>
        <Reveal>
          <LandingMonitoringSection />
        </Reveal>
        <Reveal>
          <LandingIntegrationsShowcase />
        </Reveal>
        <Reveal>
          <LandingAnalyticsShowcase />
        </Reveal>
        <Reveal>
          <LandingDeveloperSide />
        </Reveal>
        <Reveal>
          <LandingFinalCta />
        </Reveal>

        {false && (
          <>
            {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
              Visual automation for modern teams
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Design, run and monitor automations with Zyper.
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Build workflows from triggers, actions and executions in a canvas made for automation.
              Connect webhooks, schedules, email, HTTP and messaging — with full history and logs for
              every run.
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
            </div>

            <p className="text-xs text-slate-500">
              No credit card required · Start with webhooks, schedules, email and HTTP.
            </p>
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
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    Customer signup workflow
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  Live
                </span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* Sidebar mock */}
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Triggers
                  </p>
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

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Actions
                  </p>
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
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Trigger
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Incoming webhook</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Receive JSON payloads from your app.
                          </p>
                        </div>
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                          Listening
                        </span>
                      </div>
                    </div>

                    <div className="mx-auto w-px flex-1 bg-gradient-to-b from-slate-300/80 to-slate-200/30" />

                    <div className="mx-auto w-full max-w-md space-y-3">
                      <div className="rounded-card border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Action
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Store in database</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Insert sanitized rows into your own DB.
                        </p>
                      </div>
                      <div className="rounded-card border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Action
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Send notification</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Alert your team via Telegram or email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Trusted by teams building modern automations
          </p>
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
              <span className="h-6 w-6 rounded bg-slate-900" />
              <span>Acme Analytics</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
              <span className="h-6 w-6 rounded bg-slate-900" />
              <span>Northwind Cloud</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
              <span className="h-6 w-6 rounded bg-slate-900" />
              <span>Pixel Labs</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
              <span className="h-6 w-6 rounded bg-slate-900" />
              <span>Lambda Ops</span>
            </div>
          </div>
        </section>

        {/* Features */}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Visual workflow editor</h3>
            <p className="text-sm text-slate-600">
              Drag and connect triggers, actions and branches on a canvas tuned for automation design.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <GitBranch className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Triggers & actions</h3>
            <p className="text-sm text-slate-600">
              Start flows from webhooks, schedules or email. Chain HTTP, email, Telegram, DB and transform steps.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Activity className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Execution history</h3>
            <p className="text-sm text-slate-600">
              Inspect every run with inputs, outputs and timing so you can trust your automations in production.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Logs & debugging</h3>
            <p className="text-sm text-slate-600">
              Step‑by‑step logs and error details help you debug failed runs without digging through server logs.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <span className="text-[11px] font-semibold">WH</span>
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Webhooks & scheduling</h3>
            <p className="text-sm text-slate-600">
              Combine inbound webhooks with cron‑style schedules to respond instantly or on your own cadence.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <span className="text-[11px] font-semibold">FX</span>
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Transform & route data</h3>
            <p className="text-sm text-slate-600">
              Normalize payloads, branch by conditions and send data to the right destination every time.
            </p>
          </div>
        </div>
      </section>

        {/* Starter templates / use cases */}
        <section id="templates" className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Start from a template
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a starter workflow and customize it in the visual editor.
            </p>
          </div>
          <Link
            href="/workflows"
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Browse all workflows
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/workflows?create=1&template=webhook-db"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Data capture
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Webhook to database
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Receive webhook payloads and store them in your own database with transforms in‑between.
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Webhook → Transform → Database
            </p>
          </Link>

          <Link
            href="/workflows?create=1&template=schedule-telegram"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Notifications
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Schedule to Telegram
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Send daily or hourly summaries straight to a Telegram channel using cron‑style schedules.
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Schedule → Transform → Telegram
            </p>
          </Link>

          <Link
            href="/workflows?create=1&template=email-http"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Inbox automation
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Email trigger to HTTP
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                React to incoming emails and fan out to your internal APIs or third‑party services.
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Email trigger → HTTP request
            </p>
          </Link>

          <Link
            href="/workflows?create=1&template=lead-routing"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                GTM
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Lead routing workflow
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Enrich, score and route incoming leads to the right owner automatically.
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Webhook → Transform → HTTP / Email
            </p>
          </Link>

          <Link
            href="/workflows?create=1&template=data-pipeline"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-sm shadow-card hover:border-red-200 hover:shadow-card-hover transition-all"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Data
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Data transform pipeline
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Normalize and reshape data before sending it to warehouses, CRMs or internal tools.
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-500">
              Webhook / Schedule → Transform → DB / HTTP
            </p>
          </Link>
        </div>
      </section>

        {/* Monitoring / logging section (anchor for #monitoring) */}
        <section id="monitoring" className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
              Observability built‑in
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              See every execution, log and payload — without leaving Zyper.
            </h2>
            <p className="text-sm text-slate-600">
              Execution history, step‑level logs and payload views help you understand what happened
              in each run. Debug failures quickly and ship automations you can trust.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>• Filter runs by status, workflow or trigger.</li>
              <li>• Inspect inputs and outputs for any step.</li>
              <li>• Spot trends and regressions across executions.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Activity className="h-4 w-4 text-red-500" />
                <span>Execution history</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Last 24 hours
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-800">Webhook → DB → Telegram</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">153ms</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-slate-800">Schedule → Email report</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">3.4s</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="font-medium text-slate-800">Email trigger → HTTP</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">failed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-2xl border border-red-100 bg-[#FEF2F2] px-6 py-6 text-center shadow-sm sm:px-10 sm:py-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Create your first workflow today.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Connect a trigger, add actions and watch your first executions appear in Zyper.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              Try demo
            </Link>
            <Link
              href="/executions"
              className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              View execution history
            </Link>
          </div>
        </section>
          </>
        )}
      </main>

      <Reveal>
        <LandingFooter />
      </Reveal>

      {false && (
        <>
          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Zyper. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#templates" className="hover:text-slate-900">
              Templates
            </a>
            <a href="/home" className="hover:text-slate-900">
              Go to app
            </a>
          </div>
        </div>
          </footer>
        </>
      )}
      </div>
    </div>
  );
}
