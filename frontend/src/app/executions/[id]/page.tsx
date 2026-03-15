import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { ExecutionStatusBadge } from '@/components/executions/ExecutionStatusBadge';
import { TriggerBadge } from '@/components/workflows/TriggerBadge';
import { ErrorBlock } from '@/components/executions/ErrorBlock';
import { StepCard } from '@/components/executions/StepCard';
import type { StepData } from '@/components/executions/StepCard';
import { CodePanel } from '@/components/executions/CodePanel';
import {
  ArrowLeft,
  Clock,
  Workflow,
  ListOrdered,
  Inbox,
  Outbox,
} from 'lucide-react';

type ExecutionDetail = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  inputPayload: unknown;
  outputPayload: unknown;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  steps: StepData[];
  workflow: { id: string; name: string; status: string; isPaused: boolean };
};

async function getExecution(id: string): Promise<ExecutionDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/executions/${id}`, {
      next: { revalidate: 5 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatTs(s: string): string {
  return new Date(s).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

function execDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—';
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const execution = await getExecution(id);
  if (!execution) notFound();

  const hasError = !!execution.errorMessage;
  const failedStepIndex = execution.steps.findIndex((s) => s.status === 'failed');

  return (
    <div className="space-y-8">
      <Link
        href="/executions"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to execution history
      </Link>

      {/* ——— Execution summary ——— */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Execution summary
          </h2>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="font-mono text-sm text-slate-500" title={execution.id}>
                {execution.id}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/workflows/${execution.workflowId}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-accent"
                >
                  <Workflow className="h-4 w-4" />
                  {execution.workflow.name}
                </Link>
                <TriggerBadge trigger={execution.triggerType} />
                <ExecutionStatusBadge status={execution.status} />
              </div>
              <p className="text-sm text-slate-600">
                Workflow status: {execution.workflow.isPaused ? 'Paused' : execution.workflow.status}
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Started {formatTs(execution.startedAt)}</span>
              </div>
              {execution.finishedAt && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Finished {formatTs(execution.finishedAt)}</span>
                </div>
              )}
              <div className="font-mono font-medium text-slate-700">
                Duration: {execDuration(execution.startedAt, execution.finishedAt)}
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ——— Execution-level error ——— */}
      {hasError && (
        <section>
          <ErrorBlock
            title="Execution failed"
            message={execution.errorMessage!}
            subtitle={
              failedStepIndex >= 0
                ? `Failure at step ${failedStepIndex + 1}: ${execution.steps[failedStepIndex]?.nodeName || execution.steps[failedStepIndex]?.nodeId}`
                : undefined
            }
          />
        </section>
      )}

      {/* ——— Step timeline ——— */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Execution steps
            {execution.steps.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({execution.steps.length} step{execution.steps.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
        </div>

        {execution.steps.length === 0 ? (
          <div className="rounded-xl border border-slate-200 border-dashed bg-slate-50/50 py-12 text-center text-slate-500">
            No steps recorded for this execution.
          </div>
        ) : (
          <div className="space-y-0">
            {execution.steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                isLast={i === execution.steps.length - 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* ——— Input / Output payloads ——— */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Inbox className="h-5 w-5 text-slate-500" />
          Payloads
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Inbox className="h-4 w-4" />
              Input (trigger)
            </h3>
            <CodePanel
              title="Input payload"
              content={JSON.stringify(execution.inputPayload ?? {}, null, 2)}
              defaultOpen={true}
            />
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Outbox className="h-4 w-4" />
              Output (result)
            </h3>
            <CodePanel
              title="Output payload"
              content={JSON.stringify(execution.outputPayload ?? {}, null, 2)}
              defaultOpen={execution.status === 'success'}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
