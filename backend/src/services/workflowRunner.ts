import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import { executionLogService } from './executionLog.service.js';
import { onExecutionFailed } from './notification.service.js';
import { dispatchAction } from '../modules/actions/index.js';

const TRIGGER_TYPES = ['webhook', 'schedule', 'email'] as const;
const ACTION_TYPES = ['http', 'email', 'telegram', 'db', 'transform'] as const;

const DEFAULT_RETRY_COUNT = 3;
const MAX_RETRY_LIMIT = 10;

type Node = {
  id: string;
  type: string;
  config?: Record<string, unknown> & { retryCount?: number; pauseOnError?: boolean };
  name?: string;
};

type Edge = { source: string; target: string };

type WorkflowDefinition = {
  nodes: Node[];
  edges: Edge[];
  pauseOnError?: boolean;
};

function getNodeRetryCount(node: Node): number {
  const n = node.config?.retryCount;
  if (n === undefined || n === null) return DEFAULT_RETRY_COUNT;
  const v = Number(n);
  if (!Number.isInteger(v) || v < 0) return DEFAULT_RETRY_COUNT;
  return Math.min(v, MAX_RETRY_LIMIT);
}

function isTrigger(type: string): boolean {
  return TRIGGER_TYPES.includes(type as (typeof TRIGGER_TYPES)[number]);
}

function isAction(type: string): boolean {
  return ACTION_TYPES.includes(type as (typeof ACTION_TYPES)[number]);
}

function getTriggerNode(nodes: Node[]): Node | null {
  return nodes.find((n) => isTrigger(n.type)) ?? null;
}

/** BFS from trigger; return action nodes in execution order. */
function getOrderedActionNodes(nodes: Node[], edges: Edge[], triggerId: string): Node[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outEdges = new Map<string, string[]>();
  for (const e of edges) {
    if (!outEdges.has(e.source)) outEdges.set(e.source, []);
    outEdges.get(e.source)!.push(e.target);
  }
  const ordered: Node[] = [];
  const visited = new Set<string>();
  const queue: string[] = [triggerId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node && isAction(node.type)) ordered.push(node);
    for (const nextId of outEdges.get(id) ?? []) {
      if (!visited.has(nextId)) queue.push(nextId);
    }
  }
  return ordered;
}

function executeAction(
  node: Node,
  input: unknown,
  context: { workflowId: string; executionId: string }
): Promise<Record<string, unknown>> {
  return dispatchAction(node.type, node.config ?? {}, input, context);
}

/** Run workflow for given execution: load workflow + execution, run steps, update DB. */
export async function runWorkflowExecution(params: {
  executionId: string;
  workflowId: string;
  triggerType: string;
  inputPayload?: unknown;
}): Promise<void> {
  const { executionId, workflowId, inputPayload } = params;

  const [workflow, execution] = await Promise.all([
    prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true, name: true, definitionJson: true, isPaused: true },
    }),
    prisma.execution.findUnique({
      where: { id: executionId },
      select: { id: true, status: true },
    }),
  ]);

  if (!workflow || !execution) return;
  if (workflow.isPaused) {
    await executionLogService.failExecutionEarly(executionId, 'Workflow is paused');
    return;
  }

  const def = workflow.definitionJson as WorkflowDefinition;
  const nodes = def?.nodes ?? [];
  const edges = def?.edges ?? [];

  const trigger = getTriggerNode(nodes);
  if (!trigger) {
    await executionLogService.failExecutionEarly(executionId, 'No trigger node in workflow');
    return;
  }

  const actionNodes = getOrderedActionNodes(nodes, edges, trigger.id);
  await executionLogService.startExecution(executionId);

  let previousOutput: unknown = inputPayload ?? {};

  for (let stepIndex = 0; stepIndex < actionNodes.length; stepIndex++) {
    const node = actionNodes[stepIndex];
    const maxRetries = getNodeRetryCount(node);
    const pauseOnError =
      def?.pauseOnError === true || node.config?.pauseOnError === true;

    const step = await executionLogService.createStep(executionId, {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      inputData: previousOutput as Prisma.InputJsonValue,
    });

    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const output = await executeAction(node, previousOutput, { workflowId, executionId });
        await executionLogService.completeStepSuccess(step.id, {
          outputData: output as Prisma.InputJsonValue,
          retryCount,
        });
        previousOutput = output;
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        retryCount++;
        if (retryCount > maxRetries) {
          await executionLogService.completeStepFailure(step.id, {
            errorMessage: lastError.message,
            retryCount,
          });
        } else {
          await executionLogService.updateStepRetry(step.id, retryCount);
        }
        if (retryCount > maxRetries) break;
      }
    }

    if (lastError) {
      const status = pauseOnError ? 'paused' : 'failed';
      await executionLogService.finishExecution(executionId, {
        status,
        errorMessage: lastError.message,
      });
      if (pauseOnError) {
        await prisma.workflow.update({
          where: { id: workflowId },
          data: { isPaused: true },
        });
      }
      await onExecutionFailed({
        workflowId,
        workflowName: workflow.name,
        executionId,
        status,
        errorMessage: lastError.message,
        definitionJson: def,
      });
      return;
    }
  }

  await executionLogService.finishExecution(executionId, {
    status: 'success',
    outputPayload: previousOutput as Prisma.InputJsonValue,
  });
}
