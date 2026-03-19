'use client';

import { useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Circle, AlertTriangle, X } from 'lucide-react';
import { CodePanel } from '@/components/executions/CodePanel';
import { NODE_LABELS, isTriggerType } from './types';

export type ExecutionWithSteps = {
  id: string;
  status: string;
  triggerType: string;
  inputPayload?: unknown;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  steps: Array<{
    id: string;
    nodeId: string;
    nodeName: string | null;
    nodeType: string;
    status: string; // running | success | failed
    inputData: unknown;
    outputData: unknown;
    errorMessage: string | null;
    retryCount: number;
    startedAt: string;
    finishedAt: string | null;
  }>;
};

export type ExpectedNode = {
  nodeId: string;
  nodeType: string;
  nodeName?: string | null;
};

type Props = {
  execution: ExecutionWithSteps | null;
  loading?: boolean;
  expected: ExpectedNode[];
  onToggleStep?: (nodeId: string) => void;
  openStepNodeId?: string | null;
  onClose?: () => void;
};

function stepLabel(nodeType: string, nodeName?: string | null) {
  const base = NODE_LABELS[nodeType] ?? nodeType;
  return nodeName ? `${nodeName}` : base;
}

function stepSummary(nodeType: string, status: string, outputData: unknown) {
  if (status === 'skipped') return 'Skipped';
  if (status === 'failed') return 'Failed';
  if (status === 'running') return 'Running…';
  if (nodeType === 'http') {
    const s = outputData as Record<string, unknown> | null;
    const code = s && typeof s.status === 'number' ? s.status : null;
    return code ? `${code} OK` : 'Request completed';
  }
  if (nodeType === 'telegram') return 'Message sent';
  if (nodeType === 'email') return 'Email sent';
  if (nodeType === 'db') return 'Record saved';
  if (nodeType === 'transform') return 'Output generated';
  return 'Success';
}

function statusPill(status: string) {
  if (status === 'success')
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200';
  if (status === 'failed')
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200';
  if (status === 'skipped')
    return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200';
  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200';
}

export function ExecutionResultsPanel({
  execution,
  loading = false,
  expected,
  openStepNodeId,
  onToggleStep,
  onClose,
}: Props) {
  const merged = useMemo(() => {
    if (!execution) {
      return {
        trigger: null as null | { title: string; status: string; summary: string; input: unknown },
        steps: [] as Array<{
          nodeId: string;
          title: string;
          nodeType: string;
          status: 'success' | 'failed' | 'running' | 'skipped';
          summary: string;
          input: unknown;
          output: unknown;
          error: string | null;
          retryCount: number;
        }>,
      };
    }

    const triggerTitle = isTriggerType(execution.triggerType)
      ? NODE_LABELS[execution.triggerType] ?? execution.triggerType
      : execution.triggerType;
    const trigger = {
      title: `${triggerTitle}: payload received`,
      status: 'success',
      summary: 'Trigger received',
      input: execution.inputPayload ?? {},
    };

    const byNodeId = new Map(execution.steps.map((s) => [s.nodeId, s]));
    const steps = expected.map((n) => {
      const s = byNodeId.get(n.nodeId);
      if (!s) {
        const shouldSkip = execution.status === 'failed' || execution.status === 'paused';
        return {
          nodeId: n.nodeId,
          title: stepLabel(n.nodeType, n.nodeName),
          nodeType: n.nodeType,
          status: (shouldSkip ? 'skipped' : 'running') as 'skipped' | 'running',
          summary: shouldSkip ? 'Skipped' : 'Waiting…',
          input: {},
          output: {},
          error: null,
          retryCount: 0,
        };
      }
      const st = (s.status === 'success' ? 'success' : s.status === 'failed' ? 'failed' : 'running') as
        | 'success'
        | 'failed'
        | 'running';
      return {
        nodeId: n.nodeId,
        title: stepLabel(s.nodeType, s.nodeName),
        nodeType: s.nodeType,
        status: st,
        summary: stepSummary(s.nodeType, st, s.outputData),
        input: s.inputData ?? {},
        output: s.outputData ?? {},
        error: s.errorMessage ?? null,
        retryCount: s.retryCount ?? 0,
      };
    });

    return { trigger, steps };
  }, [execution, expected]);

  if (!execution && !loading) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden transition-opacity duration-200 dark:border-slate-600 dark:bg-slate-800/95">
      <div className="border-b border-slate-200/80 bg-white px-5 py-4 dark:border-slate-600 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Last execution
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {loading ? 'Running…' : execution ? `Status: ${execution.status}` : '—'}
            </p>
            {execution?.errorMessage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">{execution.errorMessage}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusPill(execution?.status ?? '')}`}>
              {execution?.status ?? '—'}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {merged.trigger && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-slate-600 dark:bg-slate-700/50">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-50">{merged.trigger.title}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Webhook: payload stored as execution input.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            </div>
            <div className="mt-3">
              <CodePanel title="Payload" content={JSON.stringify(merged.trigger.input ?? {}, null, 2)} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {merged.steps.map((s, idx) => {
            const open = openStepNodeId === s.nodeId;
            const Icon = s.status === 'success' ? CheckCircle2 : s.status === 'failed' ? XCircle : s.status === 'skipped' ? AlertTriangle : Circle;
            const iconClass =
              s.status === 'success'
                ? 'text-emerald-600'
                : s.status === 'failed'
                  ? 'text-red-600'
                  : s.status === 'skipped'
                    ? 'text-amber-600'
                    : 'text-slate-500';
            return (
                <div
                  key={s.nodeId}
                  className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-600 dark:bg-slate-800"
                >
                <button
                  type="button"
                  onClick={() => onToggleStep?.(s.nodeId)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/60 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-50">
                        {idx + 1}. {s.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 truncate dark:text-slate-300">
                        {s.summary}
                        {s.retryCount > 0 ? ` · retries: ${s.retryCount}` : ''}
                      </p>
                      {s.error && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-300 truncate">{s.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusPill(s.status)}`}>
                      {s.status}
                    </span>
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    )}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-slate-200/80 p-4 space-y-3 bg-white dark:border-slate-600 dark:bg-slate-800">
                    {s.status === 'skipped' ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Этот шаг не был выполнен, потому что выполнение остановилось раньше.
                      </p>
                    ) : (
                      <>
                        <CodePanel title="Input" content={JSON.stringify(s.input ?? {}, null, 2)} defaultOpen={false} />
                        <CodePanel title="Output" content={JSON.stringify(s.output ?? {}, null, 2)} defaultOpen={s.status === 'failed'} />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

