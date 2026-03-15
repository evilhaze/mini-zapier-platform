'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExecutionsHistoryTable } from '@/components/executions/ExecutionsHistoryTable';
import type { ExecutionRow } from '@/components/executions/ExecutionsHistoryTable';
import { fetchExecutions } from '@/lib/executions-api';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 20;

type Props = {
  initialExecutions: ExecutionRow[];
  total: number;
  page: number;
};

export function ExecutionsHistoryView({
  initialExecutions,
  total,
  page: initialPage,
}: Props) {
  const searchParams = useSearchParams();
  const status = searchParams?.get('status') ?? '';
  const workflowId = searchParams?.get('workflowId') ?? '';

  const [executions, setExecutions] = useState<ExecutionRow[]>(initialExecutions);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setExecutions(initialExecutions);
    setPage(initialPage);
  }, [initialExecutions, initialPage, status, workflowId]);

  const hasMore = executions.length < total;
  const totalLoaded = executions.length;

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const next = await fetchExecutions(
        { ...(status && { status }), ...(workflowId && { workflowId }) },
        { page: page + 1, limit: PAGE_SIZE }
      );
      setExecutions((prev) => [...prev, ...next.data]);
      setPage(next.page);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ExecutionsHistoryTable executions={executions} />
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Load more (${totalLoaded} of ${total})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
