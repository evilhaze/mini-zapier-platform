import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

const TRIGGER_TYPES = ['webhook', 'schedule', 'email'] as const;
const ACTION_TYPES = ['http', 'email', 'telegram', 'db', 'transform'] as const;

const MAX_RETRIES = 3;

type Node = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  name?: string;
};

type Edge = { source: string; target: string };

type WorkflowDefinition = {
  nodes: Node[];
  edges: Edge[];
  pauseOnError?: boolean;
};

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

import { dispatchAction } from '../modules/actions/index.js';

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
      select: { id: true, definitionJson: true, isPaused: true },
    }),
    prisma.execution.findUnique({
      where: { id: executionId },
      select: { id: true, status: true },
    }),
  ]);

  if (!workflow || !execution) return;
  if (workflow.isPaused) {
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: 'failed', errorMessage: 'Workflow is paused', finishedAt: new Date() },
    });
    return;
  }

  const def = workflow.definitionJson as WorkflowDefinition;
  const nodes = def?.nodes ?? [];
  const edges = def?.edges ?? [];
  const pauseOnError = def?.pauseOnError === true;

  const trigger = getTriggerNode(nodes);
  if (!trigger) {
    await prisma.execution.update({
      where: { id: executionId },
      data: { status: 'failed', errorMessage: 'No trigger node in workflow', finishedAt: new Date() },
    });
    return;
  }

  const actionNodes = getOrderedActionNodes(nodes, edges, trigger.id);
  await prisma.execution.update({
    where: { id: executionId },
    data: { status: 'running' },
  });

  let previousOutput: unknown = inputPayload ?? {};

  for (let stepIndex = 0; stepIndex < actionNodes.length; stepIndex++) {
    const node = actionNodes[stepIndex];
    const step = await prisma.executionStep.create({
      data: {
        executionId,
        nodeId: node.id,
        nodeName: node.name ?? undefined,
        nodeType: node.type,
        status: 'running',
        inputData: previousOutput as Prisma.InputJsonValue,
        retryCount: 0,
      },
    });

    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= MAX_RETRIES) {
      try {
        const output = await executeAction(node, previousOutput, { workflowId, executionId });
        await prisma.executionStep.update({
          where: { id: step.id },
          data: {
            status: 'success',
            outputData: output as Prisma.InputJsonValue,
            finishedAt: new Date(),
            retryCount,
          },
        });
        previousOutput = output;
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        retryCount++;
        await prisma.executionStep.update({
          where: { id: step.id },
          data: {
            retryCount,
            ...(retryCount > MAX_RETRIES
              ? {
                  status: 'failed',
                  errorMessage: lastError.message,
                  finishedAt: new Date(),
                }
              : {}),
          },
        });
        if (retryCount > MAX_RETRIES) break;
      }
    }

    if (lastError) {
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          errorMessage: lastError.message,
          finishedAt: new Date(),
        },
      });
      if (pauseOnError) {
        await prisma.workflow.update({
          where: { id: workflowId },
          data: { isPaused: true },
        });
      }
      return;
    }
  }

  await prisma.execution.update({
    where: { id: executionId },
    data: {
      status: 'success',
      outputPayload: previousOutput as Prisma.InputJsonValue,
      finishedAt: new Date(),
    },
  });
}
