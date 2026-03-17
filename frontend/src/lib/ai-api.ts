import { API_BASE } from './api';

export type WorkflowDraft = {
  name: string;
  description: string;
  definitionJson: {
    nodes: Array<{
      id: string;
      type: string;
      config?: Record<string, unknown>;
      name?: string;
      position?: { x: number; y: number };
    }>;
    edges: Array<{ source: string; target: string }>;
  };
  message?: string;
};

export async function generateWorkflowDraft(prompt: string): Promise<WorkflowDraft> {
  const res = await fetch(`${API_BASE}/ai/generate-workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string; message?: string }).error
      ?? (data as { error?: string; message?: string }).message
      ?? res.statusText;
    throw new Error(msg);
  }
  return data as WorkflowDraft;
}
