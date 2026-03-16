import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { getWorkflow } from '@/api';

type Props = {
  params: { id: string };
};

export default async function WorkflowDetailPage({ params }: Props) {
  const { id } = params;

  let name = id;
  try {
    const wf = await getWorkflow(id);
    if (wf?.name) {
      name = wf.name;
    }
  } catch {
    // best‑effort; keep fallback name
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to workflows
        </Link>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <GitBranch className="h-4 w-4" aria-hidden />
            </span>
            <span className="truncate">{name}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Workflow details and executions overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/editor/${id}`}
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Open in editor
          </Link>
          <Link
            href={`/executions?workflowId=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-2 rounded-btn bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-slate-800"
          >
            View executions
          </Link>
        </div>
      </header>

      <div className="rounded-card border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-card">
        This workflow detail view is a lightweight placeholder. Use the editor to design the
        automation and the executions page to inspect its runs.
      </div>
    </div>
  );
}

