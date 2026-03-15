'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Pencil,
  PlayCircle,
  PauseCircle,
  Play,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  runWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  deleteWorkflow,
} from '@/lib/workflows-api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  workflowId: string;
  workflowName: string;
  isPaused: boolean;
};

export function WorkflowDetailActions({
  workflowId,
  workflowName,
  isPaused,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'run' | 'pause' | 'delete' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleRun = async () => {
    setLoading('run');
    try {
      const { executionId } = await runWorkflow(workflowId);
      toast.success('Execution started');
      router.push(`/executions/${executionId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed');
      setLoading(null);
    }
  };

  const handlePause = async () => {
    setLoading('pause');
    try {
      await pauseWorkflow(workflowId);
      toast.success('Workflow paused');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Pause failed');
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    setLoading('pause');
    try {
      await resumeWorkflow(workflowId);
      toast.success('Workflow resumed');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Resume failed');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading('delete');
    try {
      await deleteWorkflow(workflowId);
      toast.success(`"${workflowName}" deleted`);
      setDeleteOpen(false);
      router.push('/workflows');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setLoading(null);
    }
  };

  const busy = loading !== null;

  return (
    <>
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
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-dark disabled:opacity-50"
        >
          {loading === 'run' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Run now
        </button>
        {isPaused ? (
          <button
            type="button"
            onClick={handleResume}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {loading === 'pause' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Resume
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 shadow-sm hover:bg-amber-100 disabled:opacity-50"
          >
            {loading === 'pause' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PauseCircle className="h-4 w-4" />
            )}
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete workflow"
        description={`Delete "${workflowName}"? This cannot be undone. All execution history for this workflow will be removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={loading === 'delete'}
      />
    </>
  );
}
