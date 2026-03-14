export type TriggerType = 'webhook' | 'schedule' | 'email';
export type ActionType = 'http' | 'email' | 'telegram' | 'db' | 'transform';

export type TriggerNode = {
  id: string;
  type: TriggerType;
  config: Record<string, unknown>;
  // schedule: cron expression; webhook: path; email: filters
};

export type ActionNode = {
  id: string;
  type: ActionType;
  config: Record<string, unknown>;
};

export type WorkflowNode = TriggerNode | ActionNode;

export type Edge = { source: string; target: string };

export type WorkflowDefinition = {
  nodes: WorkflowNode[];
  edges: Edge[];
};

export type StepContext = {
  executionId: string;
  workflowId: string;
  previousOutput: Record<string, unknown>;
  stepIndex: number;
};
