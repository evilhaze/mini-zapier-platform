import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewWorkflowPage() {
  return (
    <div className="max-w-lg space-y-6">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Workflows
      </Link>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">New workflow</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a workflow via API: POST /api/workflows with name and
          definitionJson, then open the editor with the returned id.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Or wire this page to a form that calls the API and redirects to
          /editor/[id].
        </p>
        <Link
          href="/workflows"
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark"
        >
          ← Back to workflows
        </Link>
      </div>
    </div>
  );
}
