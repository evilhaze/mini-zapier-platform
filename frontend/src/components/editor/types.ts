/**
 * Backend definition format (stored in workflow.definitionJson).
 */
export type WorkflowNodeDef = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  name?: string;
  position?: { x: number; y: number };
};

export type WorkflowEdgeDef = {
  source: string;
  target: string;
};

export type DefinitionJson = {
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
};

export const TRIGGER_TYPES = ['webhook', 'schedule', 'email', 'manual'] as const;
export const ACTION_TYPES = ['http', 'email', 'telegram', 'db', 'transform'] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];
export type ActionType = (typeof ACTION_TYPES)[number];
export type NodeType = TriggerType | ActionType;

export function isTriggerType(t: string): t is TriggerType {
  return TRIGGER_TYPES.includes(t as TriggerType);
}

export function isActionType(t: string): t is ActionType {
  return ACTION_TYPES.includes(t as ActionType);
}

export const NODE_LABELS: Record<string, string> = {
  webhook: 'Webhook',
  schedule: 'Schedule',
  email: 'Email trigger',
  manual: 'Manual',
  http: 'HTTP Request',
  telegram: 'Telegram',
  db: 'Database',
  transform: 'Transform',
};
