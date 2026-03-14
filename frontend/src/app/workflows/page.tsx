import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { WorkflowCard } from '@/components/workflows/WorkflowCard';
import { WorkflowTable } from '@/components/workflows/WorkflowTable';
import type { WorkflowItem } from '@/components/workflows/WorkflowCard';
import { Plus } from 'lucide-react';

async function getWorkflows(): Promise<WorkflowItem[]> {
  try {
    const res = await fetch(`${API_BASE}/workflows`, { next: { revalidate: 10 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Workflows</h1>
          <p className="mt-1 text-slate-500">
            Create and manage automation workflows
          </p>
        </div>
        <Link
          href="/workflows/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-card hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New workflow
        </Link>
      </div>

      {/* Card layout on small screens, table on larger */}
      <div className="block lg:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          {workflows.map((w) => (
            <WorkflowCard key={w.id} w={w} />
          ))}
        </div>
        {workflows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No workflows yet. Create one to get started.
          </div>
        )}
      </div>
      <div className="hidden lg:block">
        <WorkflowTable workflows={workflows} />
      </div>
    </div>
  );
}
