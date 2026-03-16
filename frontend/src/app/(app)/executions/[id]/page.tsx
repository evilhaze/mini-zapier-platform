import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getExecution, getExecutionSteps } from '@/api';
import { StepCard } from '@/components/executions/StepCard';

type Props = {
  params: { id: string };
};

export default async function ExecutionDetailPage({ params }: Props) {
  const { id } = params;

  const [execution, steps] = await Promise.all([
    getExecution(id).catch(() => null),
    getExecutionSteps(id).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/executions"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to executions
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Execution {execution?.id ?? id}
        </h1>
        {execution && (
          <p className="text-sm text-slate-500">
            Workflow {execution.workflow_id} · {execution.trigger_type} ·{' '}
            {execution.status}
          </p>
        )}
      </header>

      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
        {steps.length === 0 && (
          <div className="rounded-card border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-card">
            No steps found for this execution.
          </div>
        )}
      </div>
    </div>
  );
}

