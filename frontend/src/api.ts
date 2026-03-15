const API = '/api';

export type Workflow = {
  id: string;
  name: string;
  description: string | null;
  definition: string;
  enabled: number;
  created_at: string;
  updated_at: string;
};

export type WorkflowDefinition = {
  nodes: { id: string; type: string; config?: Record<string, unknown> }[];
  edges: { source: string; target: string }[];
};

export type Execution = {
  id: string;
  workflow_id: string;
  trigger_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
};

export type ExecutionStep = {
  id: number;
  execution_id: string;
  node_id: string;
  step_index: number;
  status: string;
  input_data: string | null;
  output_data: string | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  retry_count: number;
};

export type Stats = { total: number; success: number; failed: number };

export async function getWorkflows(): Promise<Workflow[]> {
  const r = await fetch(API + '/workflows');
  if (!r.ok) throw new Error('Failed to fetch workflows');
  return r.json();
}

export async function getWorkflow(id: string): Promise<Workflow> {
  const r = await fetch(API + '/workflows/' + id);
  if (!r.ok) throw new Error('Workflow not found');
  return r.json();
}

export async function createWorkflow(data: {
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  enabled?: boolean;
}): Promise<Workflow> {
  const r = await fetch(API + '/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateWorkflow(
  id: string,
  data: Partial<{ name: string; description: string; definition: WorkflowDefinition; enabled: boolean }>
): Promise<Workflow> {
  const r = await fetch(API + '/workflows/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const r = await fetch(API + '/workflows/' + id, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
}

export async function runWorkflow(id: string, payload?: Record<string, unknown>): Promise<{ executionId: string }> {
  const r = await fetch(API + '/workflows/' + id + '/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getExecutions(params?: { workflowId?: string; limit?: number }): Promise<Execution[]> {
  const q = new URLSearchParams();
  if (params?.workflowId) q.set('workflowId', params.workflowId);
  if (params?.limit) q.set('limit', String(params.limit));
  const r = await fetch(API + '/executions?' + q);
  if (!r.ok) throw new Error('Failed to fetch executions');
  return r.json();
}

export async function getExecution(id: string): Promise<Execution> {
  const r = await fetch(API + '/executions/' + id);
  if (!r.ok) throw new Error('Execution not found');
  return r.json();
}

export async function getExecutionSteps(id: string): Promise<ExecutionStep[]> {
  const r = await fetch(API + '/executions/' + id + '/steps');
  if (!r.ok) throw new Error('Failed to fetch steps');
  return r.json();
}

export async function getStats(workflowId?: string): Promise<Stats> {
  const q = workflowId ? '?workflowId=' + workflowId : '';
  const r = await fetch(API + '/executions/stats' + q);
  if (!r.ok) throw new Error('Failed to fetch stats');
  return r.json();
}

export function webhookUrl(workflowId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return base + API + '/triggers/webhook/' + workflowId;
}
