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
  summary?: string;
  missingFields?: Array<{ nodeId: string; nodeLabel?: string; field: string; hint?: string }>;
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

// --- Editor command (AI assistant in editor) ---

export type EditorOpAddNode = {
  op: 'add_node';
  node: {
    id: string;
    type: string;
    config?: Record<string, unknown>;
    name?: string;
    position?: { x: number; y: number };
  };
  connectFrom?: string;
};

export type EditorOpUpdateNode = {
  op: 'update_node';
  nodeId: string;
  config?: Record<string, unknown>;
  name?: string;
};

export type EditorOpConnect = { op: 'connect_nodes'; source: string; target: string };
export type EditorOpDeleteNode = { op: 'delete_node'; nodeId: string };
export type EditorOpDeleteEdge = { op: 'delete_edge'; source: string; target: string };

export type EditorOperation =
  | EditorOpAddNode
  | EditorOpUpdateNode
  | EditorOpConnect
  | EditorOpDeleteNode
  | EditorOpDeleteEdge;

export type EditorCommandResult =
  | { type: 'explain'; summary: string }
  | {
      type: 'missing_fields';
      missingFields: Array<{ nodeId: string; nodeLabel?: string; field: string; hint?: string }>;
    }
  | { type: 'apply_operations'; operations: EditorOperation[]; summary: string };

export async function sendEditorCommand(
  definitionJson: { nodes: Array<{ id: string; type?: string; config?: Record<string, unknown>; name?: string; position?: { x: number; y: number } }>; edges: Array<{ source: string; target: string }> },
  prompt: string,
  selectedNodeId?: string | null
): Promise<EditorCommandResult> {
  const res = await fetch(`${API_BASE}/ai/editor-command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ definitionJson, prompt: prompt.trim(), selectedNodeId: selectedNodeId ?? null }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string; message?: string }).error ?? (data as { message?: string }).message ?? res.statusText;
    throw new Error(msg);
  }
  return data as EditorCommandResult;
}
