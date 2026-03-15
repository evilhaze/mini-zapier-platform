import { fetchWorkflowsWithStats } from '@/lib/workflows-api';
import { fetchExecutions } from '@/lib/executions-api';
import { ExecutionsFilters } from '@/components/executions/ExecutionsFilters';
import { ExecutionsHistoryView } from '@/components/executions/ExecutionsHistoryView';
import type { ExecutionRow } from '@/components/executions/ExecutionsHistoryTable';
import { Activity, Filter } from 'lucide-react';

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ status?: string; workflowId?: string; page?: string }>;
};

export default async function ExecutionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status ?? '';
  const workflowId = params.workflowId ?? '';
  const page = Math.max(1, parseInt(params.page || '1', 10));

  const filters = {
    ...(status && { status }),
    ...(workflowId && { workflowId }),
  };

  const [workflowsRes, executionsRes] = await Promise.all([
    fetchWorkflowsWithStats().then((list) =>
      list.map((w) => ({ id: w.id, name: w.name }))
    ),
    fetchExecutions(filters, { page, limit: PAGE_SIZE }),
  ]);

  const executions: ExecutionRow[] = (executionsRes.data ?? []).map((e: ExecutionRow) => ({
    ...e,
    workflow: e.workflow ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Activity className="h-7 w-7 text-accent" aria-hidden />
            Execution history
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Monitor runs, inspect status and duration, debug failures
          </p>
        </div>
      </div>

      <div className="rounded-card border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <ExecutionsFilters workflows={workflowsRes} />
        </div>
      </div>

      <div className="rounded-card border border-slate-200/80 bg-slate-50/30 overflow-hidden">
        <ExecutionsHistoryView
          initialExecutions={executions}
          total={executionsRes.total}
          page={executionsRes.page}
        />
      </div>
    </div>
  );
}
