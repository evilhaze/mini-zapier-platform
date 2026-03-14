'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Standalone page for creating workflow (e.g. direct link).
 * Redirects to /workflows so the user can use the modal there, or we show a short message.
 */
export default function NewWorkflowPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workflows');
  }, [router]);

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Workflows
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Redirecting to workflows…</p>
        <p className="mt-2 text-sm text-slate-500">
          Use &quot;Create workflow&quot; to add a new workflow.
        </p>
      </div>
    </div>
  );
}
