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

export type ExecutionStep = {
  id: string;
  executionId: string;
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

export type ExecutionDetail = {
  id: string;
  workflowId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
  inputPayload?: Record<string, unknown> | null;
  steps?: ExecutionStep[];
};

export async function fetchExecutionById(id: string): Promise<ExecutionDetail> {
  const res = await fetch(`${API_BASE}/executions/${id}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch execution');
  return res.json();
}
