import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import { executionLogService } from './executionLog.service.js';
import { onExecutionFailed } from './notification.service.js';
import { dispatchAction } from '../modules/actions/index.js';

const TRIGGER_TYPES = ['webhook', 'schedule', 'manual', 'email'] as const;
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
  /** BullMQ job id is usually set to executionId */
  jobId?: string | number;
  /** BullMQ attemptsMade is 0-based; pass "attempt #1..N" for logs */
  jobAttempt?: number;
}): Promise<void> {
  const { executionId, workflowId, inputPayload, jobAttempt, jobId } = params;

  const EXECUTION_TIMEOUT_MS = Number(process.env.WORKFLOW_EXECUTION_TIMEOUT_MS ?? '300000'); // 5m default
  const STEP_TIMEOUT_MS = Number(process.env.WORKFLOW_STEP_TIMEOUT_MS ?? '60000'); // 60s default

  const withTimeout = async <T,>(
    promise: Promise<T>,
    ms: number,
    label: string
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
      ),
    ]);
  };

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

  const executionStatus = execution.status;
  console.log(
    `[workflowRunner] start ex=${executionId} wf=${workflowId} status=${executionStatus} job=${String(
      jobId ?? executionId
    )} attempt=${jobAttempt ?? '?'} triggerType=${params.triggerType}`
  );

  // Idempotency for BullMQ retries: don't re-run finished executions.
  if (executionStatus === 'success' || executionStatus === 'failed' || executionStatus === 'paused') {
    console.log(`[workflowRunner] skip ex=${executionId} (already ${executionStatus})`);
    return;
  }

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
  const executionDeadline = Date.now() + (Number.isFinite(EXECUTION_TIMEOUT_MS) && EXECUTION_TIMEOUT_MS > 0 ? EXECUTION_TIMEOUT_MS : 300000);

  // Transition pending -> running only once. If we can't, another worker/job already took ownership.
  if (executionStatus === 'pending') {
    const started = await executionLogService.startExecution(executionId);
    if (!started) {
      console.warn(`[workflowRunner] skip ex=${executionId} (not pending anymore)`);
      return;
    }
  }

  // Resume chaining: skip nodes that already have status=success and reuse outputData as input for next nodes.
  const actionNodeIds = actionNodes.map((n) => n.id);
  const existingSteps = await prisma.executionStep.findMany({
    where: { executionId, nodeId: { in: actionNodeIds } },
    orderBy: { startedAt: 'desc' },
    select: { id: true, nodeId: true, status: true, outputData: true },
  });

  const stepByNodeId = new Map<
    string,
    { id: string; nodeId: string; status: string; outputData: unknown }
  >();
  for (const s of existingSteps) {
    // In case historical duplicates exist, keep the latest.
    if (!stepByNodeId.has(s.nodeId)) {
      stepByNodeId.set(s.nodeId, s);
    }
  }

  let previousOutput: unknown = inputPayload ?? {};

  for (let stepIndex = 0; stepIndex < actionNodes.length; stepIndex++) {
    const node = actionNodes[stepIndex];
    const maxRetries = getNodeRetryCount(node);
    const pauseOnError =
      def?.pauseOnError === true || node.config?.pauseOnError === true;

    if (Date.now() > executionDeadline) {
      const err = new Error(
        `Workflow execution timed out after ${Math.round(EXECUTION_TIMEOUT_MS / 1000)}s`
      );
      await executionLogService.finishExecution(executionId, { status: 'failed', errorMessage: err.message });
      await onExecutionFailed({
        workflowId,
        workflowName: workflow.name,
        executionId,
        status: 'failed',
        errorMessage: err.message,
        definitionJson: def,
      });
      return;
    }

    const existingStep = stepByNodeId.get(node.id);
    if (existingStep?.status === 'success') {
      previousOutput = existingStep.outputData ?? previousOutput;
      continue;
    }

    console.log(`[workflowRunner] step start ex=${executionId} node=${node.id} type=${node.type}`);

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
        const output = await withTimeout(
          executeAction(node, previousOutput, { workflowId, executionId }),
          STEP_TIMEOUT_MS,
          `Action step node=${node.id}`
        );
        await executionLogService.completeStepSuccess(step.id, {
          outputData: output as Prisma.InputJsonValue,
          retryCount,
        });
        previousOutput = output;
        stepByNodeId.set(node.id, {
          id: step.id,
          nodeId: node.id,
          status: 'success',
          outputData: output,
        });
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const isTimeout = lastError.message.includes('timed out after');

        // Safety: our step timeout uses Promise.race and doesn't cancel the underlying request,
        // so retrying on timeouts can cause duplicate side effects (multiple in-flight calls).
        // For timeouts we mark the step as failed immediately and do not retry.
        if (isTimeout) {
          await executionLogService.completeStepFailure(step.id, {
            errorMessage: lastError.message,
            retryCount: maxRetries + 1,
          });
          retryCount = maxRetries + 1;
          break;
        }

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
