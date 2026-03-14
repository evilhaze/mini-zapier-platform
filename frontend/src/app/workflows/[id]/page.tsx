import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { StatusBadge } from '@/components/workflows/StatusBadge';
import { Pencil, PlayCircle, ListChecks } from 'lucide-react';

type Workflow = {
  id: string;
  name: string;
  status: string;
  isPaused: boolean;
  definitionJson: unknown;
  createdAt: string;
  updatedAt: string;
};

async function getWorkflow(id: string): Promise<Workflow | null> {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  if (!workflow) notFound();

  const status = workflow.isPaused ? 'paused' : workflow.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{workflow.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-sm text-slate-500">
              Updated {new Date(workflow.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/editor/${workflow.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <Link
            href={`/workflows/${workflow.id}/run`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card hover:bg-accent-dark"
          >
            <PlayCircle className="h-4 w-4" />
            Run
          </Link>
          <Link
            href={`/workflows/${workflow.id}/executions`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-card hover:bg-slate-50"
          >
            <ListChecks className="h-4 w-4" />
            Executions
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Definition
        </h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-700 font-mono">
          {JSON.stringify(workflow.definitionJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
