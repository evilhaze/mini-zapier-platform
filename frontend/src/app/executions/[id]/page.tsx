import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { ExecutionStatusBadge } from '@/components/executions/ExecutionStatusBadge';
import { TriggerBadge } from '@/components/workflows/TriggerBadge';
import { ArrowLeft, Clock, FileCode, AlertCircle } from 'lucide-react';

type Step = {
  id: string;
  nodeId: string;
  nodeName: string | null;
  nodeType: string;
  status: string;
  inputData: unknown;
  outputData: unknown;
  errorMessage: string | null;
  retryCount: number;
  startedAt: string;
  finishedAt: string | null;
};

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
  steps: Step[];
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

function stepDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—';
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
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

  return (
    <div className="space-y-6">
      <Link
        href="/executions"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to execution history
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-sm text-slate-500 truncate" title={execution.id}>
                {execution.id}
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-slate-900">
                {execution.workflow.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TriggerBadge trigger={execution.triggerType} />
                <ExecutionStatusBadge status={execution.status} />
              </div>
            </div>
            <dl className="mt-2 sm:mt-0 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Started {formatTs(execution.startedAt)}</span>
              </div>
              {execution.finishedAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Finished {formatTs(execution.finishedAt)}</span>
                </div>
              )}
              <div className="font-mono text-slate-700">
                Duration: {execDuration(execution.startedAt, execution.finishedAt)}
              </div>
            </dl>
          </div>
        </div>

        {execution.errorMessage && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-800">Execution error</p>
                <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-sm text-red-700">
                  {execution.errorMessage}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            <FileCode className="h-4 w-4" />
            Step logs
          </h2>
        </div>
        <ul className="divide-y divide-slate-200">
          {execution.steps.length === 0 ? (
            <li className="px-5 py-10 text-center text-slate-500 text-sm">
              No steps recorded.
            </li>
          ) : (
            execution.steps.map((step, i) => (
              <li key={step.id} className="px-5 py-4 hover:bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-slate-400">#{i + 1}</span>
                  <span className="font-medium text-slate-800">
                    {step.nodeName || step.nodeId}
                  </span>
                  <span className="text-slate-500 text-sm">({step.nodeType})</span>
                  <ExecutionStatusBadge status={step.status} />
                  <span className="text-xs text-slate-400 tabular-nums">
                    {stepDuration(step.startedAt, step.finishedAt)}
                  </span>
                  {step.retryCount > 0 && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      {step.retryCount} retries
                    </span>
                  )}
                </div>
                {step.errorMessage && (
                  <p className="mt-2 text-sm text-red-600 font-mono">{step.errorMessage}</p>
                )}
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                    View input / output
                  </summary>
                  <pre className="mt-2 overflow-auto max-h-64 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                    {JSON.stringify(
                      { input: step.inputData, output: step.outputData },
                      null,
                      2
                    )}
                  </pre>
                </details>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <details className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden group">
          <summary className="cursor-pointer border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50">
            Trigger input
          </summary>
          <pre className="overflow-auto max-h-64 p-4 font-mono text-xs text-slate-700 bg-slate-50/50">
            {JSON.stringify(execution.inputPayload ?? {}, null, 2)}
          </pre>
        </details>
        <details className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden group">
          <summary className="cursor-pointer border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50">
            Final output
          </summary>
          <pre className="overflow-auto max-h-64 p-4 font-mono text-xs text-slate-700 bg-slate-50/50">
            {JSON.stringify(execution.outputPayload ?? {}, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
