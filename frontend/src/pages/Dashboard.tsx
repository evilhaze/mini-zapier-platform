import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GitBranch, Play, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { getWorkflows, getStats, type Workflow, type Stats } from '../api';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getWorkflows(), getStats()])
      .then(([w, s]) => {
        setWorkflows(w);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Workflows</h1>
          <p className="text-surface-600 mt-1">Create and manage your automations</p>
        </div>
        <Link
          to="/workflows/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New workflow
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-surface-600" />
              </div>
              <div>
                <p className="text-sm text-surface-600">Total runs</p>
                <p className="text-xl font-semibold text-surface-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-surface-600">Successful</p>
                <p className="text-xl font-semibold text-green-700">{stats.success}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-surface-600">Failed</p>
                <p className="text-xl font-semibold text-red-700">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-3">All workflows</h2>
        {workflows.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 border-dashed p-12 text-center">
            <GitBranch className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600 font-medium">No workflows yet</p>
            <p className="text-sm text-surface-500 mt-1">Create your first workflow to automate tasks</p>
            <Link
              to="/workflows/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              Create workflow
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {workflows.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-xl border border-surface-200 p-4 flex items-center justify-between hover:border-surface-300 transition-colors group"
              >
                <Link to={'/workflows/' + w.id} className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <GitBranch className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 truncate">{w.name}</p>
                    <p className="text-sm text-surface-500 truncate">
                      {w.description || 'No description'} · {w.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={'/executions?workflowId=' + w.id}
                    className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                    title="View runs"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setMenuId(menuId === w.id ? null : w.id)}
                      className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuId === w.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white rounded-lg border border-surface-200 shadow-lg z-20">
                          <Link
                            to={'/workflows/' + w.id}
                            className="block px-3 py-2 text-sm text-surface-700 hover:bg-surface-50"
                            onClick={() => setMenuId(null)}
                          >
                            Edit
                          </Link>
                          <Link
                            to={'/executions?workflowId=' + w.id}
                            className="block px-3 py-2 text-sm text-surface-700 hover:bg-surface-50"
                            onClick={() => setMenuId(null)}
                          >
                            View runs
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
