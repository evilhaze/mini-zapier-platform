import { API_BASE } from './api';

export type ExecutionListItem = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  workflow?: { id: string; name: string } | null;
};

export type ExecutionsListResponse = {
  data: ExecutionListItem[];
  total: number;
  page: number;
  limit: number;
};

export type ExecutionsFilters = {
  workflowId?: string;
  status?: string;
};

export type ExecutionsPagination = {
  page?: number;
  limit?: number;
};

export async function fetchExecutions(
  filters: ExecutionsFilters = {},
  pagination: ExecutionsPagination = {}
): Promise<ExecutionsListResponse> {
  const params = new URLSearchParams();
  if (filters.workflowId) params.set('workflowId', filters.workflowId);
  if (filters.status) params.set('status', filters.status);
  if (pagination.page) params.set('page', String(pagination.page));
  if (pagination.limit) params.set('limit', String(pagination.limit));
  const q = params.toString();
  const res = await fetch(`${API_BASE}/executions${q ? `?${q}` : ''}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch executions');
  return res.json();
}
