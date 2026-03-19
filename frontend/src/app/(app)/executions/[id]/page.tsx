import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { StepCard } from '@/components/executions/StepCard';
import { fetchExecutionById } from '@/lib/executions-api';

type Props = {
  params: Promise<{ id: string }>;
};

function isEmailPayload(p: unknown): p is { from?: string; to?: string; subject?: string; text?: string; html?: string } {
  return p != null && typeof p === 'object' && !Array.isArray(p);
}

function EmailPayloadCard({ payload }: { payload: { from?: string; to?: string; subject?: string; text?: string; html?: string } }) {
  const from = payload.from ?? '—';
  const to = payload.to ?? '—';
  const subject = payload.subject ?? '—';
  const rawBody = (payload.text || payload.html || '').trim();
  const plainBody = typeof rawBody === 'string' ? rawBody.replace(/<[^>]*>/g, '') : String(rawBody);
  const preview = plainBody ? plainBody.slice(0, 200) : '—';
  const hasMore = plainBody.length > 200;

  return (
    <div className="rounded-card border border-slate-200/80 bg-white p-4 shadow-card dark:border-slate-600 dark:bg-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-600">
        <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Email trigger payload
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">From</dt>
          <dd className="mt-0.5 font-mono text-slate-900 dark:text-slate-100 break-all">{from}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">To</dt>
          <dd className="mt-0.5 font-mono text-slate-900 dark:text-slate-100 break-all">{to}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject</dt>
          <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{subject}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Body preview</dt>
          <dd className="mt-0.5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
            {preview}
            {hasMore ? '…' : ''}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default async function ExecutionDetailPage({ params }: Props) {
  const { id } = await params;

  const execution = await fetchExecutionById(id).catch(() => null);
  const steps = execution?.steps ?? [];
  const showEmailPayload = execution?.triggerType === 'email' && isEmailPayload(execution?.inputPayload);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/executions"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to executions
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Execution {execution?.id ?? id}
        </h1>
        {execution && (
          <p className="text-sm text-slate-500">
            Workflow {execution.workflowId} · {execution.triggerType} ·{' '}
            {execution.status}
          </p>
        )}
      </header>

      {showEmailPayload && execution?.inputPayload && (
        <EmailPayloadCard payload={execution.inputPayload as { from?: string; to?: string; subject?: string; text?: string; html?: string }} />
      )}

      <div className="space-y-4">
        {steps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} isLast={index === steps.length - 1} />
        ))}
        {steps.length === 0 && (
          <div className="rounded-card border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-card">
            No steps found for this execution.
          </div>
        )}
      </div>
    </div>
  );
}

