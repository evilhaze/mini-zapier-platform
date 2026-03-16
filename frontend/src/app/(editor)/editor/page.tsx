import Link from 'next/link';
import { GitBranch, Sparkles } from 'lucide-react';

export default function EditorLandingPage() {
  return (
    <div className="h-screen bg-slate-50">
      <div className="flex h-full flex-col gap-4 px-6 py-4">
        <header className="space-y-2">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Visual editor
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Design workflows in the editor.
          </h1>
          <p className="max-w-xl text-sm text-slate-500">
            Pick a workflow from the list and open it in the canvas editor to add triggers,
            actions and branches.
          </p>
        </header>

        <div className="flex-1 rounded-xl border border-dashed border-slate-200/80 bg-white p-8 text-sm text-slate-600 shadow-card flex items-center justify-center">
          <div className="max-w-md text-center space-y-4">
            <p>
              To start editing, first choose a workflow in your workspace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/workflows"
                className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700"
              >
                <GitBranch className="h-4 w-4" aria-hidden />
                Go to workflows
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

