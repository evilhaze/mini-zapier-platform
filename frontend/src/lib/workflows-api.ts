import { API_BASE } from './api';

export type WorkflowWithStats = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  isPaused: boolean;
  definitionJson: unknown;
  createdAt: string;
  updatedAt: string;
  triggerType: string;
  lastRunAt: string | null;
  executionCount: number;
  successRate: number;
};

export async function fetchWorkflowsWithStats(): Promise<WorkflowWithStats[]> {
  const res = await fetch(`${API_BASE}/workflows?stats=1`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function fetchWorkflowWithStats(id: string): Promise<WorkflowWithStats | null> {
  const res = await fetch(`${API_BASE}/workflows/${id}?stats=1`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function runWorkflow(
  id: string,
  inputPayload?: Record<string, unknown>
): Promise<{ executionId: string; status: string }> {
  const res = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputPayload: inputPayload ?? {} }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? res.statusText;
    throw new Error(msg);
  }
  return data as { executionId: string; status: string };
}

export async function pauseWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workflows/${id}/pause`, {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? res.statusText);
  }
}

export async function resumeWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workflows/${id}/resume`, {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? res.statusText);
  }
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? res.statusText);
  }
}
