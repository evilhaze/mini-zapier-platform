import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { StatusBadge } from '@/components/workflows/StatusBadge';
import { ArrowLeft } from 'lucide-react';

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/executions"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Executions
          </Link>
          <span className="text-slate-400">|</span>
          <div>
            <h1 className="font-mono text-lg font-medium text-slate-900">
              {execution.id}
            </h1>
            <p className="text-sm text-slate-500">
              {execution.workflow.name} · {execution.triggerType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={execution.status} />
          <span className="text-sm text-slate-500">
            {new Date(execution.startedAt).toLocaleString()}
            {execution.finishedAt &&
              ` – ${new Date(execution.finishedAt).toLocaleString()}`}
          </span>
        </div>
      </div>

      {execution.errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Error:</strong> {execution.errorMessage}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        <h2 className="border-b border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Steps
        </h2>
        <ul className="divide-y divide-slate-200">
          {execution.steps.length === 0 ? (
            <li className="px-6 py-8 text-center text-slate-500">
              No steps recorded.
            </li>
          ) : (
            execution.steps.map((step, i) => (
              <li key={step.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">#{i + 1}</span>
                  <span className="font-medium text-slate-800">{step.nodeName || step.nodeId}</span>
                  <span className="text-slate-500">({step.nodeType})</span>
                  <StatusBadge status={step.status} />
                  {step.retryCount > 0 && (
                    <span className="text-xs text-amber-600">
                      {step.retryCount} retries
                    </span>
                  )}
                </div>
                {step.errorMessage && (
                  <p className="mt-2 text-sm text-red-600">{step.errorMessage}</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                    I/O
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 font-mono text-xs text-slate-700">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h3 className="text-xs font-semibold uppercase text-slate-500">Input</h3>
          <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 font-mono text-xs text-slate-700">
            {JSON.stringify(execution.inputPayload ?? {}, null, 2)}
          </pre>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h3 className="text-xs font-semibold uppercase text-slate-500">Output</h3>
          <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 font-mono text-xs text-slate-700">
            {JSON.stringify(execution.outputPayload ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
