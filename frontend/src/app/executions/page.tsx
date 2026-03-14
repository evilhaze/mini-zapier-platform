import { API_BASE } from '@/lib/api';
import { ExecutionsTable } from '@/components/executions/ExecutionsTable';
import type { ExecutionItem } from '@/components/executions/ExecutionsTable';

type ListResponse = {
  data: ExecutionItem[];
  total: number;
  page: number;
  limit: number;
};

async function getExecutions(): Promise<ExecutionItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/executions?limit=50`,
      { next: { revalidate: 15 } }
    );
    if (!res.ok) return [];
    const body: ListResponse = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

export default async function ExecutionsPage() {
  const executions = await getExecutions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Executions</h1>
        <p className="mt-1 text-slate-500">
          Run history and logs — inspect status and steps
        </p>
      </div>

      <ExecutionsTable executions={executions} showWorkflow />
    </div>
  );
}
