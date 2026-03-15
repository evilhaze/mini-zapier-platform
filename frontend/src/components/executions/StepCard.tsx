'use client';

import { ExecutionStatusBadge } from '@/components/executions/ExecutionStatusBadge';
import { ErrorBlock } from '@/components/executions/ErrorBlock';
import { CodePanel } from '@/components/executions/CodePanel';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

export type StepData = {
  id: string;
  nodeId: string;
  nodeName: string | null;
  nodeType: string;
  status: string;
  inputData: unknown;
  outputData: unknown;
  errorMessage: string | null;
  retryCount: number;
  startedAt: string;
  finishedAt: string | null;
};

type Props = {
  step: StepData;
  index: number;
  isLast: boolean;
};

function stepDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return '—';
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function StepCard({ step, index, isLast }: Props) {
  const failed = step.status === 'failed';
  const success = step.status === 'success';

  const StatusIcon =
    success ? CheckCircle2 : failed ? XCircle : Circle;

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
            failed
              ? 'border-red-300 bg-red-50 text-red-600'
              : success
                ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <StatusIcon
            className={`h-4 w-4 ${success ? '' : failed ? '' : 'fill-slate-400'}`}
            aria-hidden
          />
        </div>
        {!isLast && (
          <div className="mt-1 w-0.5 h-10 bg-slate-200" aria-hidden />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0 pb-8">
        <div
          className={`rounded-card border-2 bg-white shadow-soft overflow-hidden ${
            failed
              ? 'border-red-200'
              : success
                ? 'border-emerald-100'
                : 'border-slate-200'
          }`}
        >
          {/* Step header */}
          <div className="flex flex-wrap items-center gap-2 gap-y-1.5 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <span className="font-mono text-xs font-semibold text-slate-500">
              Step {index + 1}
            </span>
            <span className="font-medium text-slate-900">
              {step.nodeName || step.nodeId}
            </span>
            <span className="text-slate-500 text-sm">({step.nodeType})</span>
            <ExecutionStatusBadge status={step.status} />
            <span className="text-xs text-slate-400 tabular-nums ml-auto">
              {stepDuration(step.startedAt, step.finishedAt)}
            </span>
            {step.retryCount > 0 && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {step.retryCount} retr{step.retryCount === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>

          {/* Step error */}
          {step.errorMessage && (
            <div className="border-t border-red-100 p-4 bg-red-50/50">
              <ErrorBlock
                title="Step failed"
                message={step.errorMessage}
                subtitle={`Step ${index + 1}: ${step.nodeName || step.nodeId}`}
              />
            </div>
          )}

          {/* I/O panels */}
          <div className="border-t border-slate-100 p-4 space-y-3">
            <CodePanel
              title="Input"
              content={JSON.stringify(step.inputData ?? {}, null, 2)}
              defaultOpen={failed}
            />
            <CodePanel
              title="Output"
              content={JSON.stringify(step.outputData ?? {}, null, 2)}
              defaultOpen={failed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
