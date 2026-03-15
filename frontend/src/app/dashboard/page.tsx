import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import type { OverviewStats } from '@/components/dashboard/StatisticsCards';
import { EmptyState } from '@/components/ui/EmptyState';
import { GitBranch, ListChecks, LayoutDashboard } from 'lucide-react';

async function getStats(): Promise<OverviewStats> {
  try {
    const res = await fetch(`${API_BASE}/statistics/overview`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  } catch {
    return {
      totalWorkflows: 0,
      activeWorkflows: 0,
      pausedWorkflows: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      pausedExecutions: 0,
      successRate: 0,
      recentExecutionsCount: 0,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Overview of workflows and execution statistics
        </p>
      </div>

      <section>
        <h2 className="sr-only">Statistics</h2>
        {stats.totalWorkflows === 0 && stats.totalExecutions === 0 ? (
          <EmptyState
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="Your dashboard is ready"
            description="Create a workflow to start automating tasks. Your stats and run history will show up here."
            action={
              <Link
                href="/workflows"
                className="inline-flex items-center gap-2 rounded-btn bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-accent-dark transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                Create workflow
              </Link>
            }
          />
        ) : (
          <StatisticsCards stats={stats} />
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/workflows"
          className="flex items-center gap-2.5 rounded-card border border-slate-200/80 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 shadow-card hover:shadow-card-hover hover:border-slate-300/80 hover:text-accent transition-all"
        >
          <GitBranch className="h-4 w-4 text-slate-400" />
          View all workflows
        </Link>
        <Link
          href="/executions"
          className="flex items-center gap-2.5 rounded-card border border-slate-200/80 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 shadow-card hover:shadow-card-hover hover:border-slate-300/80 hover:text-accent transition-all"
        >
          <ListChecks className="h-4 w-4 text-slate-400" />
          View executions
        </Link>
      </section>
    </div>
  );
}
