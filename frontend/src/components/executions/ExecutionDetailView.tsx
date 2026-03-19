'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { StepCard } from '@/components/executions/StepCard';
import { fetchExecutionById, type ExecutionDetail } from '@/lib/executions-api';

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const TERMINAL_STATUSES = ['success', 'failed', 'paused'];

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

type Props = {
  executionId: string;
  initialExecution: ExecutionDetail | null;
};

export function ExecutionDetailView({ executionId, initialExecution }: Props) {
  const [execution, setExecution] = useState<ExecutionDetail | null>(initialExecution);

  useEffect(() => {
    if (!execution || TERMINAL_STATUSES.includes(execution.status)) return;

    const start = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        return;
      }
      try {
        const next = await fetchExecutionById(executionId);
        setExecution(next);
        if (TERMINAL_STATUSES.includes(next.status)) clearInterval(timer);
      } catch {
        // keep polling on network error
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [executionId, execution?.status]);

  const steps = execution?.steps ?? [];
  const showEmailPayload = execution?.triggerType === 'email' && isEmailPayload(execution?.inputPayload);
  const isRunning = execution?.status === 'pending' || execution?.status === 'running';

  if (!execution && !initialExecution) {
    return (
      <div className="space-y-6">
        <Link href="/executions" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to executions
        </Link>
        <p className="text-sm text-slate-500">Execution not found.</p>
      </div>
    );
  }

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
          Execution {execution?.id ?? executionId}
        </h1>
        {execution && (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            Workflow {execution.workflowId} · {execution.triggerType} · {execution.status}
            {isRunning && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
            )}
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
        {steps.length === 0 && !isRunning && (
          <div className="rounded-card border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-card">
            No steps found for this execution.
          </div>
        )}
        {steps.length === 0 && isRunning && (
          <div className="rounded-card border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-card flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden />
            Running…
          </div>
        )}
      </div>
    </div>
  );
}
