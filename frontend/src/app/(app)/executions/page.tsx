import { Suspense } from 'react';
import { getWorkflows } from '@/api';
import { ExecutionsHistoryView } from '@/components/executions/ExecutionsHistoryView';
import { fetchExecutions } from '@/lib/executions-api';
import { ExecutionsFilters } from '@/components/executions/ExecutionsFilters';

const PAGE_SIZE = 20;

async function ExecutionsContent() {
  const [workflows, initial] = await Promise.all([
    getWorkflows().catch(() => []),
    fetchExecutions({}, { page: 1, limit: PAGE_SIZE }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Executions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inspect recent runs across all workflows, with status and timing.
          </p>
        </div>
      </header>

      <ExecutionsFilters
        workflows={workflows.map((w) => ({ id: w.id, name: w.name }))}
      />

      <ExecutionsHistoryView
        initialExecutions={initial.data}
        total={initial.total}
        page={initial.page}
      />
    </div>
  );
}

export default function ExecutionsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading executions…</div>}>
      <ExecutionsContent />
    </Suspense>
  );
}

