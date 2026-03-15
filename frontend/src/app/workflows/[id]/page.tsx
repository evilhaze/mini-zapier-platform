import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { fetchWorkflowWithStats } from '@/lib/workflows-api';
import { StatusBadge } from '@/components/workflows/StatusBadge';
import { TriggerBadge } from '@/components/workflows/TriggerBadge';
import { WorkflowDetailActions } from '@/components/workflows/WorkflowDetailActions';
import { ExecutionsTable } from '@/components/executions/ExecutionsTable';
import type { ExecutionItem } from '@/components/executions/ExecutionsTable';
import { ArrowLeft, Pencil, Calendar, BarChart3 } from 'lucide-react';

type ListResponse = { data: ExecutionItem[]; total: number; page: number; limit: number };

async function getRecentExecutions(workflowId: string, limit = 10): Promise<ExecutionItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/executions?workflowId=${workflowId}&limit=${limit}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const body: ListResponse = await res.json();
    const data = body.data ?? [];
    return data.map((e: ExecutionItem) => ({ ...e, workflow: undefined }));
  } catch {
    return [];
  }
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [workflow, recentExecutions] = await Promise.all([
    fetchWorkflowWithStats(id),
    getRecentExecutions(id, 10),
  ]);
  if (!workflow) notFound();

  const status = workflow.isPaused ? 'paused' : workflow.status;
  const executionsWithWorkflow = recentExecutions.map((e) => ({
    ...e,
    workflow: { id: workflow.id, name: workflow.name },
  }));

  return (
    <div className="space-y-8">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workflows
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{workflow.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge status={status} />
              <TriggerBadge triggerType={workflow.triggerType} />
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Created {formatDate(workflow.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Updated {formatDate(workflow.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span>
                  {workflow.executionCount} run{workflow.executionCount !== 1 ? 's' : ''}
                  {workflow.executionCount > 0
                    ? ` · ${(workflow.successRate * 100).toFixed(1)}% success`
                    : ''}
                </span>
              </div>
            </dl>
          </div>
          <WorkflowDetailActions workflowId={workflow.id} isPaused={workflow.isPaused} />
        </div>
      </div>

      {/* Summary + editor link */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
        <p className="text-sm text-slate-600">
          {workflow.description || 'No description.'}{' '}
          <Link
            href={`/editor/${workflow.id}`}
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Open in editor
          </Link>
        </p>
      </div>

      {/* Recent executions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent executions</h2>
          <Link
            href={`/workflows/${workflow.id}/executions`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <ExecutionsTable executions={executionsWithWorkflow} showWorkflow={false} />
      </section>
    </div>
  );
}
