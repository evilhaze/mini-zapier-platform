import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { getExecution, getExecutionSteps, getWorkflow, type Execution, type ExecutionStep, type Workflow } from '../api';

export default function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getExecution(id),
      getExecutionSteps(id),
    ]).then(([ex, st]) => {
      setExecution(ex);
      setSteps(st);
      if (ex.workflow_id) {
        getWorkflow(ex.workflow_id).then(setWorkflow);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !execution) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    return <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />;
  };

  const formatDate = (s: string) => new Date(s).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/executions"
          className="p-2 rounded-lg text-surface-600 hover:bg-surface-100 hover:text-surface-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-surface-900">
            {workflow?.name ?? execution.workflow_id}
          </h1>
          <p className="text-sm text-surface-500">
            {formatDate(execution.started_at)} · {execution.trigger_type} · {execution.status}
          </p>
        </div>
        {statusIcon(execution.status)}
      </div>

      {execution.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {execution.error_message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-surface-100 font-semibold text-surface-900">
          Step log
        </h2>
        <ul className="divide-y divide-surface-100">
          {steps.map((step, idx) => {
            const isExpanded = expanded === idx;
            return (
              <li key={step.id}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-surface-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-surface-400 shrink-0" />
                  )}
                  {statusIcon(step.status)}
                  <span className="font-mono text-sm text-surface-700">
                    Step {step.step_index} · {step.node_id}
                  </span>
                  {step.retry_count > 0 && (
                    <span className="text-amber-600 text-xs">retry {step.retry_count}</span>
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 pl-12 bg-surface-50 border-t border-surface-100">
                    <div className="rounded-lg border border-surface-200 overflow-hidden">
                      {step.input_data && (
                        <div className="p-3 border-b border-surface-200">
                          <p className="text-xs font-medium text-surface-500 mb-1">Input</p>
                          <pre className="text-xs font-mono text-surface-800 overflow-auto max-h-40 bg-white p-2 rounded">
                            {JSON.stringify(JSON.parse(step.input_data), null, 2)}
                          </pre>
                        </div>
                      )}
                      {step.output_data && (
                        <div className="p-3 border-b border-surface-200">
                          <p className="text-xs font-medium text-surface-500 mb-1">Output</p>
                          <pre className="text-xs font-mono text-surface-800 overflow-auto max-h-40 bg-white p-2 rounded">
                            {JSON.stringify(JSON.parse(step.output_data), null, 2)}
                          </pre>
                        </div>
                      )}
                      {step.error_message && (
                        <div className="p-3 bg-red-50">
                          <p className="text-xs font-medium text-red-700 mb-1">Error</p>
                          <p className="text-xs text-red-800 font-mono">{step.error_message}</p>
                        </div>
                      )}
                      <p className="text-xs text-surface-500 p-2">
                        Started: {formatDate(step.started_at)}
                        {step.finished_at && ` · Finished: ${formatDate(step.finished_at)}`}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
