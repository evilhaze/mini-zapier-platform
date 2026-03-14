import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { History, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { getExecutions, getWorkflows, type Execution, type Workflow } from '../api';

export default function Executions() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId') || undefined;
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutions({ workflowId, limit: 50 }).then(setExecutions).finally(() => setLoading(false));
    getWorkflows().then(setWorkflows);
  }, [workflowId]);

  const workflowName = (id: string) => workflows.find((w) => w.id === id)?.name ?? id;

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Execution history</h1>
          <p className="text-surface-600 mt-1">Runs and step logs for your workflows</p>
        </div>
        {workflowId && (
          <Link
            to="/executions"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Show all
          </Link>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link
          to="/executions"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            !workflowId ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          All
        </Link>
        {workflows.map((w) => (
          <Link
            key={w.id}
            to={'/executions?workflowId=' + w.id}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              w.id === workflowId ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            {w.name}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        {executions.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600 font-medium">No executions yet</p>
            <p className="text-sm text-surface-500 mt-1">Run a workflow to see history here</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-100">
            {executions.map((ex) => (
              <li key={ex.id}>
                <Link
                  to={'/executions/' + ex.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-50 transition-colors"
                >
                  {statusIcon(ex.status)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-surface-900 truncate">
                      {workflowName(ex.workflow_id)}
                    </p>
                    <p className="text-sm text-surface-500">
                      {formatDate(ex.started_at)} · {ex.trigger_type}
                      {ex.error_message && (
                        <span className="text-red-600 ml-1">· {ex.error_message}</span>
                      )}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
