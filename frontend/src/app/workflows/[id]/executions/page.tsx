import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { ExecutionsTable } from '@/components/executions/ExecutionsTable';
import type { ExecutionItem } from '@/components/executions/ExecutionsTable';
import { ArrowLeft } from 'lucide-react';

type ListResponse = { data: ExecutionItem[]; total: number; page: number; limit: number };

async function getWorkflowName(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const w = await res.json();
    return w.name ?? null;
  } catch {
    return null;
  }
}

async function getExecutions(workflowId: string): Promise<ExecutionItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/executions?workflowId=${workflowId}&limit=50`,
      { next: { revalidate: 10 } }
    );
    if (!res.ok) return [];
    const body: ListResponse = await res.json();
    const data = body.data ?? [];
    return data.map((e: ExecutionItem) => ({ ...e, workflow: { id: workflowId, name: '' } }));
  } catch {
    return [];
  }
}

export default async function WorkflowExecutionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [name, executions] = await Promise.all([
    getWorkflowName(id),
    getExecutions(id),
  ]);
  if (name === null) notFound();

  const withNames = executions.map((e) => ({
    ...e,
    workflow: { id, name },
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/workflows/${id}`}
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {name}
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Executions</h1>
        <p className="mt-1 text-slate-500">Run history for this workflow</p>
      </div>

      <ExecutionsTable executions={withNames} showWorkflow={false} />
    </div>
  );
}
