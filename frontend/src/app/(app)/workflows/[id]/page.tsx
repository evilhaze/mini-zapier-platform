import Link from 'next/link';
import { ArrowLeft, GitBranch, Clock, Layers, ExternalLink } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { fetchWorkflowWithStats } from '@/lib/workflows-api';
import { fetchExecutions } from '@/lib/executions-api';
import { StatusBadge } from '@/components/workflows/StatusBadge';
import { TriggerBadge } from '@/components/workflows/TriggerBadge';
import { ExecutionStatusBadge } from '@/components/executions/ExecutionStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CopyButton } from '@/components/ui/CopyButton';
import { WorkflowDetailActions } from '@/components/workflows/WorkflowDetailActions';
import type { DefinitionJson } from '@/components/editor/types';

type Props = {
  params: { id: string };
};

function safeParseDefinition(definitionJson: unknown): DefinitionJson | null {
  try {
    if (!definitionJson) return null;
    if (typeof definitionJson === 'string') return JSON.parse(definitionJson) as DefinitionJson;
    if (typeof definitionJson === 'object') return definitionJson as DefinitionJson;
    return null;
  } catch {
    return null;
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function durationMs(startedAt: string, finishedAt: string | null) {
  if (!finishedAt) return null;
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function fmtDuration(ms: number | null) {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function orderedNodeList(def: DefinitionJson | null): Array<{ id: string; type: string; name?: string | null }> {
  if (!def?.nodes?.length) return [];
  const nodes = def.nodes;
  const edges = def.edges ?? [];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out = new Map<string, string[]>();
  for (const e of edges) {
    if (!out.has(e.source)) out.set(e.source, []);
    out.get(e.source)!.push(e.target);
  }
  const trigger = nodes.find((n) => ['webhook', 'schedule', 'manual', 'email'].includes(String(n.type))) ?? nodes[0];
  const ordered: Array<{ id: string; type: string; name?: string | null }> = [];
  const visited = new Set<string>();
  const q: string[] = [trigger.id];
  while (q.length) {
    const id = q.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node) ordered.push({ id: node.id, type: node.type, name: (node.name as string | undefined) ?? null });
    for (const nxt of out.get(id) ?? []) {
      if (!visited.has(nxt)) q.push(nxt);
    }
  }
  // Append any disconnected nodes (rare but possible)
  for (const n of nodes) {
    if (!visited.has(n.id)) ordered.push({ id: n.id, type: n.type, name: (n.name as string | undefined) ?? null });
  }
  return ordered;
}

export default async function WorkflowDetailPage({ params }: Props) {
  const { id } = params;

  const wf = await fetchWorkflowWithStats(id);
  const def = safeParseDefinition(wf?.definitionJson);
  const nodesList = orderedNodeList(def);
  const stepsCount = Math.max(0, nodesList.length - 1);

  const executionsRes = await fetchExecutions({ workflowId: id }, { limit: 6 }).catch(() => null);
  const recent = executionsRes?.data ?? [];

  const name = wf?.name || 'Workflow';
  const status = wf?.status || 'draft';
  const isPaused = wf?.isPaused ?? false;
  const triggerType = wf?.triggerType || (def?.nodes?.find((n) => ['webhook', 'schedule', 'manual', 'email'].includes(String(n.type)))?.type as string) || '—';
  const webhookUrl = `${API_BASE}/triggers/webhook/${id}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to workflows
        </Link>
      </div>

      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-black/5">
                <GitBranch className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={isPaused ? 'paused' : status} />
                  <TriggerBadge trigger={triggerType} />
                  <span className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    ID <span className="font-mono text-slate-600">{id.slice(0, 8)}…</span>
                    <CopyButton
                      value={id}
                      label="Copy"
                      className="ml-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    />
                  </span>
                </div>
                <div className="mt-3 grid gap-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>Updated: {formatDateTime(wf?.updatedAt)}</span>
                    <span className="text-slate-300">•</span>
                    <span>Created: {formatDateTime(wf?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <WorkflowDetailActions
              workflowId={id}
              workflowName={name}
              isPaused={isPaused}
            />
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trigger</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{String(triggerType).toUpperCase()}</p>
          {triggerType === 'webhook' && (
            <p className="mt-1 text-xs text-slate-600">External systems can POST to trigger runs.</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Steps</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{stepsCount}</p>
          <p className="mt-1 text-xs text-slate-600">Action nodes connected after the trigger.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total runs</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{wf ? wf.executionCount.toLocaleString() : '—'}</p>
          <p className="mt-1 text-xs text-slate-600">All-time executions for this workflow.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Success rate</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{wf ? `${Math.round(wf.successRate * 100)}%` : '—'}</p>
          <p className="mt-1 text-xs text-slate-600">Successful runs / total runs.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Last run</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{wf?.lastRunAt ? formatDateTime(wf.lastRunAt) : '—'}</p>
          <p className="mt-1 text-xs text-slate-600">Most recent execution start.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Last updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{wf?.updatedAt ? formatDateTime(wf.updatedAt) : '—'}</p>
          <p className="mt-1 text-xs text-slate-600">Last time this workflow was edited.</p>
        </div>
      </section>

      {/* Workflow preview */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workflow preview</p>
              <h2 className="mt-2 text-base font-semibold text-slate-900">Steps overview</h2>
              <p className="mt-1 text-sm text-slate-600">Understand what this workflow does without opening the editor.</p>
            </div>
            <Link
              href={`/editor/${id}`}
              className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700"
            >
              Open in editor
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            {nodesList.length === 0 ? (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-600">
                No nodes found in this workflow definition yet.
              </div>
            ) : (
              nodesList.map((n, idx) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm hover:bg-slate-50/60 transition-colors"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-black/5">
                    <Layers className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {idx === 0 ? 'Trigger' : `Action ${idx}`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                      {(n.name || n.type).toString()}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 font-mono truncate">
                      {n.type} · {n.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contextual trigger info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trigger details</p>
            <h2 className="mt-2 text-base font-semibold text-slate-900">How it starts</h2>
            <p className="mt-1 text-sm text-slate-600">Context and quick actions for this trigger type.</p>
          </div>

          {triggerType === 'webhook' ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-800">Webhook URL (POST)</p>
              <input
                readOnly
                value={webhookUrl}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-sm"
              />
              <div className="flex gap-2">
                <CopyButton
                  value={webhookUrl}
                  label="Copy URL"
                  className="inline-flex items-center justify-center rounded-btn border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-600">
                Send an HTTP POST request to trigger this workflow.
              </p>
            </div>
          ) : triggerType === 'manual' ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm text-slate-600">
              This workflow starts when you run it manually.
            </div>
          ) : triggerType === 'schedule' ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm text-slate-600">
              This workflow runs on a schedule. Open in editor to view schedule details and next run.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm text-slate-600">
              Trigger type: {String(triggerType)}
            </div>
          )}
        </div>
      </section>

      {/* Recent executions */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Recent executions</p>
            <h2 className="mt-2 text-base font-semibold text-slate-900">Latest runs</h2>
            <p className="mt-1 text-sm text-slate-600">Quick look at the most recent workflow activity.</p>
          </div>
          <Link
            href={`/executions?workflowId=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-2 rounded-btn border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50"
          >
            View all executions
          </Link>
        </div>

        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState
              compact
              icon={<GitBranch className="h-6 w-6" />}
              title="No executions yet"
              description="Run this workflow to see execution results and logs here."
              action={
                <Link
                  href={`/editor/${id}`}
                  className="inline-flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-700"
                >
                  Open in editor
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-xs text-slate-500">
                    <th className="py-2.5 pr-4 font-semibold">Execution</th>
                    <th className="py-2.5 pr-4 font-semibold">Status</th>
                    <th className="py-2.5 pr-4 font-semibold">Trigger</th>
                    <th className="py-2.5 pr-4 font-semibold">Started</th>
                    <th className="py-2.5 pr-4 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="py-3 pr-4">
                        <Link href={`/executions/${e.id}`} className="font-mono text-xs font-semibold text-slate-700 hover:text-slate-900">
                          {e.id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <ExecutionStatusBadge status={e.status} />
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{e.triggerType}</td>
                      <td className="py-3 pr-4 text-slate-600 tabular-nums">
                        {new Date(e.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 tabular-nums">
                        {fmtDuration(durationMs(e.startedAt, e.finishedAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

