/** Context passed to handlers that need workflow/execution ids (e.g. db) */
export type ActionContext = {
  workflowId: string;
  executionId: string;
};

/** Action handler: config from node, input from previous step, optional context */
export type ActionHandler = (
  config: Record<string, unknown>,
  input: unknown,
  context?: ActionContext
) => Promise<Record<string, unknown>>;
