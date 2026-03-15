'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, PlayCircle, PauseCircle, Play, Loader2 } from 'lucide-react';
import { runWorkflow, pauseWorkflow, resumeWorkflow } from '@/lib/workflows-api';

type Props = {
  workflowId: string;
  isPaused: boolean;
};

export function WorkflowDetailActions({ workflowId, isPaused }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'run' | 'pause' | null>(null);

  const handleRun = async () => {
    setLoading('run');
    try {
      const { executionId } = await runWorkflow(workflowId);
      router.push(`/executions/${executionId}`);
    } catch {
      setLoading(null);
    }
  };

  const handlePause = async () => {
    setLoading('pause');
    try {
      await pauseWorkflow(workflowId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    setLoading('pause');
    try {
      await resumeWorkflow(workflowId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/editor/${workflowId}`}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <Pencil className="h-4 w-4" />
        Open editor
      </Link>
      <button
        type="button"
        onClick={handleRun}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-dark disabled:opacity-50"
      >
        {loading === 'run' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
        Run now
      </button>
      {isPaused ? (
        <button
          type="button"
          onClick={handleResume}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {loading === 'pause' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Resume
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePause}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 shadow-sm hover:bg-amber-100 disabled:opacity-50"
        >
          {loading === 'pause' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
          Pause
        </button>
      )}
    </div>
  );
}
