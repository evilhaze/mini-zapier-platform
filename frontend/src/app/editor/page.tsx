import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { PencilSquare } from 'lucide-react';

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
        <h1 className="text-2xl font-semibold text-slate-900">Editor</h1>
        <p className="mt-1 text-slate-500">
          Select a workflow to edit in the canvas
        </p>
      </div>

      {workflows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <PencilSquare className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4">No workflows yet</p>
          <Link href="/workflows" className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-dark">
            Create workflow →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((w) => (
            <li key={w.id}>
              <Link
                href={`/editor/${w.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:border-accent/30 hover:shadow-card-hover"
              >
                <PencilSquare className="h-5 w-5 shrink-0 text-slate-400" />
                <span className="font-medium text-slate-900">{w.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
