import { PlugZap, Terminal } from 'lucide-react';
import { CodePanel } from '@/components/executions/CodePanel';

const WORKFLOW_SNIPPET = `// Webhook → Transform → HTTP → DB (preview)
// Request: JSON payload from your app
{
  "event": "customer.signup",
  "email": "user@example.com",
  "plan": "pro"
}

// Transform
const sanitized = {
  email: payload.email.toLowerCase(),
  plan: payload.plan,
  receivedAt: new Date().toISOString(),
};

// HTTP request
await fetch("https://api.example.com/lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(sanitized),
});

// Database write
await db.leads.insert(sanitized);

// Execution logs (per step)
// - executionId
// - step timings
// - payload snapshots
// - error details (if any)
`;

export function LandingDeveloperSide() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Developer-friendly</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Webhooks, HTTP, and transforms with readable logs
          </h2>
          <p className="text-sm text-slate-600">
            Build like a developer: keep your payloads, call your APIs, store data reliably, and debug with step-by-step
            execution history.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-start">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <PlugZap className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">What you control</h3>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Webhook payloads pass through transforms before any destination.</li>
            <li>• HTTP requests are explicit and easy to reason about.</li>
            <li>• Database writes are deterministic and logged.</li>
            <li>• Every run includes step timings, payload snapshots and errors.</li>
          </ul>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Terminal className="h-4 w-4 text-red-500" aria-hidden />
              Debug without guessing
            </div>
            <p className="mt-1 text-sm text-slate-600">
              When something fails, you can see exactly which step broke and what the payload looked like.
            </p>
          </div>
        </div>

        <div>
          <CodePanel title="Example wiring" content={WORKFLOW_SNIPPET} defaultOpen />
        </div>
      </div>
    </section>
  );
}

