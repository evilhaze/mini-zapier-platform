import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { PenSquare } from 'lucide-react';

type Workflow = { id: string; name: string; status: string; isPaused: boolean };

async function getWorkflows(): Promise<Workflow[]> {
  try {
    const res = await fetch(`${API_BASE}/workflows`, { next: { revalidate: 10 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function EditorLandingPage() {
  const workflows = await getWorkflows();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Editor</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Select a workflow to edit in the canvas
        </p>
      </div>

      {workflows.length === 0 ? (
        <EmptyState
          icon={<PenSquare className="h-6 w-6" />}
          title="No workflows to edit"
          description="Create a workflow first, then open it here to design triggers and steps on the canvas."
          action={
            <Link
              href="/workflows"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-dark"
            >
              Create workflow
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((w) => (
            <li key={w.id}>
              <Link
                href={`/editor/${w.id}`}
                className="flex items-center gap-3 rounded-card border border-slate-200/80 bg-white p-4 shadow-card transition-all hover:border-accent/30 hover:shadow-card-hover"
              >
                <PenSquare className="h-5 w-5 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-900">{w.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
