'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  PlayCircle,
  PauseCircle,
  Play,
  Trash2,
  Loader2,
  GitBranch,
} from 'lucide-react';
import {
  fetchWorkflowsWithStats,
  runWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  deleteWorkflow,
  type WorkflowWithStats,
} from '@/lib/workflows-api';
import { StatusBadge } from './StatusBadge';
import { TriggerBadge } from './TriggerBadge';
import { CreateWorkflowModal } from './CreateWorkflowModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'paused', label: 'Paused' },
] as const;

function formatDate(s: string | null): string {
  if (!s) return '—';
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString();
}

function formatRate(rate: number): string {
  if (rate === 0) return '—';
  return `${Math.round(rate * 100)}%`;
}

export function WorkflowList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workflows, setWorkflows] = useState<WorkflowWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkflowsWithStats();
      setWorkflows(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load workflows');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = workflows.filter((w) => {
    const matchSearch =
      !search.trim() ||
      w.name.toLowerCase().includes(search.trim().toLowerCase());
    const status = w.isPaused ? 'paused' : w.status;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paused' && w.isPaused) ||
      (statusFilter !== 'paused' && status === statusFilter);
    return matchSearch && matchStatus;
  });

  const handleRun = async (id: string) => {
    setActionId(id);
    try {
      const { executionId } = await runWorkflow(id);
      toast.success('Execution started');
      router.push(`/executions/${executionId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed');
      setActionId(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionId(id);
    try {
      await pauseWorkflow(id);
      toast.success('Workflow paused');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Pause failed');
    } finally {
      setActionId(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionId(id);
    try {
      await resumeWorkflow(id);
      toast.success('Workflow resumed');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Resume failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteWorkflow(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Workflows</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            All of your automations in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create workflow
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-input border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-shadow"
            aria-label="Search workflows"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton
          rows={6}
          cols={8}
          headerLabels={[
            'Name',
            'Trigger',
            'Status',
            'Last run',
            'Created',
            'Runs',
            'Success',
            'Actions',
          ]}
        />
      ) : filtered.length === 0 ? (
        workflows.length === 0 ? (
          <div className="rounded-card border border-slate-200/80 bg-white py-20 px-6 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <GitBranch className="h-8 w-8" aria-hidden />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
              Create your first workflow
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-slate-500">
              Connect apps and automate repetitive tasks. Start with a trigger (webhook, schedule, or manual) and add actions.
            </p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-8 inline-flex items-center gap-2.5 rounded-btn bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-soft hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors"
            >
              <Plus className="h-5 w-5" aria-hidden />
              Create your first workflow
            </button>
          </div>
        ) : (
          <EmptyState
            icon={<GitBranch className="h-6 w-6" />}
            title="No matching workflows"
            description="Try a different search term or filter to find what you need."
          />
        )
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="hidden overflow-hidden rounded-card border border-slate-200/80 bg-white shadow-card lg:block">
            <table className="min-w-full divide-y divide-slate-200/80" role="table">
              <thead>
                <tr className="bg-slate-50/90">
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Trigger
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last run
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Runs
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Success
                  </th>
                  <th scope="col" className="relative px-5 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filtered.map((w) => {
                  const status = w.isPaused ? 'paused' : w.status;
                  const busy = actionId === w.id;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <Link
                          href={`/workflows/${w.id}`}
                          className="font-medium text-slate-900 hover:text-accent"
                        >
                          {w.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <TriggerBadge trigger={w.triggerType} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">
                        {formatDate(w.lastRunAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm tabular-nums text-slate-600">
                        {w.executionCount}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm tabular-nums text-slate-600">
                        {formatRate(w.successRate)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            href={`/editor/${w.id}`}
                            className="rounded-btn p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Open editor"
                            aria-label={`Edit ${w.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRun(w.id)}
                            disabled={busy}
                            className="rounded-btn p-2 text-slate-400 hover:bg-slate-100 hover:text-accent disabled:opacity-50 transition-colors"
                            title="Run once"
                            aria-label={`Run ${w.name}`}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                          </button>
                          {w.isPaused ? (
                            <button
                              type="button"
                              onClick={() => handleResume(w.id)}
                              disabled={busy}
                            className="rounded-btn p-2 text-slate-400 hover:bg-slate-100 hover:text-accent disabled:opacity-50 transition-colors"
                              title="Resume"
                            aria-label={`Resume ${w.name}`}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePause(w.id)}
                            disabled={busy}
                            className="rounded-btn p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 disabled:opacity-50 transition-colors"
                              title="Pause"
                              aria-label={`Pause ${w.name}`}
                            >
                              <PauseCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(w.id, w.name)}
                            disabled={busy}
                            className="rounded-btn p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                            title="Delete"
                            aria-label={`Delete ${w.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((w) => {
              const status = w.isPaused ? 'paused' : w.status;
              const busy = actionId === w.id;
              return (
                <div
                  key={w.id}
                  className="rounded-card border border-slate-200/80 bg-white p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/workflows/${w.id}`}
                      className="min-w-0 flex-1 font-medium text-slate-900 hover:text-accent"
                    >
                      {w.name}
                    </Link>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <TriggerBadge trigger={w.triggerType} />
                    <span>Last run: {formatDate(w.lastRunAt)}</span>
                    <span>{w.executionCount} runs</span>
                    <span>{formatRate(w.successRate)} success</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/editor/${w.id}`}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editor
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRun(w.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                      Run
                    </button>
                    {w.isPaused ? (
                      <button
                        type="button"
                        onClick={() => handleResume(w.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-btn border border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePause(w.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-btn border border-slate-200/80 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <PauseCircle className="h-3.5 w-3.5" />
                        Pause
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(w.id, w.name)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-red-200/80 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CreateWorkflowModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={load}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete workflow"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This cannot be undone. All execution history for this workflow will be removed.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
