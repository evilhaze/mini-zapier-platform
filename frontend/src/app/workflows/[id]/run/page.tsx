'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function RunWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ executionId?: string; error?: string }>({});

  useEffect(() => {
    if (!id || status !== 'idle') return;
    setStatus('loading');
    fetch(`${API_BASE}/workflows/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data);
        setStatus(data.executionId ? 'done' : 'error');
      })
      .catch((e) => {
        setResult({ error: e.message || 'Request failed' });
        setStatus('error');
      });
  }, [id, status]);

  if (status === 'done' && result.executionId) {
    router.replace(`/executions/${result.executionId}`);
    return (
      <div className="flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Redirecting to execution…
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href={`/workflows/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workflow
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-900">Run workflow</h1>
        {status === 'loading' && (
          <p className="mt-2 flex items-center gap-2 text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Queuing execution…
          </p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-red-600">{result.error ?? 'Failed to run'}</p>
        )}
      </div>
    </div>
  );
}
