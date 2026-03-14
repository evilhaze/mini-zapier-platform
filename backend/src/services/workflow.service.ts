import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import { addWorkflowRunJob } from '../queue/index.js';

const workflowSelect = {
  id: true,
  name: true,
  status: true,
  isPaused: true,
  definitionJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type WorkflowCreateInput = {
  name: string;
  status?: string;
  isPaused?: boolean;
  definitionJson: Prisma.InputJsonValue;
};

export type WorkflowUpdateInput = {
  name?: string;
  status?: string;
  isPaused?: boolean;
  definitionJson?: Prisma.InputJsonValue;
};

export const workflowService = {
  async findAll() {
    return prisma.workflow.findMany({
      select: workflowSelect,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      select: workflowSelect,
    });
  },

  async create(data: WorkflowCreateInput) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        status: data.status ?? 'draft',
        isPaused: data.isPaused ?? false,
        definitionJson: data.definitionJson,
      },
      select: workflowSelect,
    });
  },

  async update(id: string, data: WorkflowUpdateInput) {
    return prisma.workflow.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isPaused !== undefined && { isPaused: data.isPaused }),
        ...(data.definitionJson !== undefined && { definitionJson: data.definitionJson }),
      },
      select: workflowSelect,
    });
  },

  async delete(id: string) {
    return prisma.workflow.delete({
      where: { id },
    });
  },

  /**
   * Create pending Execution, enqueue job, return executionId and status.
   * Throws if workflow not found (caller should map to 404).
   */
  async runWorkflow(
    workflowId: string,
    inputPayload?: Prisma.InputJsonValue
  ): Promise<{ executionId: string; status: 'queued' }> {
    return enqueueExecution(workflowId, 'manual', inputPayload);
  },

  /**
   * Webhook trigger: create Execution with inputPayload, enqueue job.
   * Throws WORKFLOW_NOT_FOUND if workflow missing, WORKFLOW_PAUSED if isPaused.
   */
  async triggerByWebhook(
    workflowId: string,
    inputPayload: Prisma.InputJsonValue
  ): Promise<{ executionId: string; status: 'queued' }> {
    return enqueueExecution(workflowId, 'webhook', inputPayload);
  },

  /**
   * Schedule trigger: create Execution, enqueue job. Call only when workflow is not paused.
   */
  async triggerBySchedule(workflowId: string): Promise<{ executionId: string; status: 'queued' }> {
    return enqueueExecution(workflowId, 'schedule', undefined);
  },
};

async function enqueueExecution(
  workflowId: string,
  triggerType: 'manual' | 'webhook' | 'schedule',
  inputPayload?: Prisma.InputJsonValue
): Promise<{ executionId: string; status: 'queued' }> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { id: true, isPaused: true },
  });
  if (!workflow) {
    const notFound = new Error('Workflow not found') as Error & { code?: string };
    notFound.code = 'WORKFLOW_NOT_FOUND';
    throw notFound;
  }
  if (triggerType === 'webhook' && workflow.isPaused) {
    const paused = new Error('Workflow is paused') as Error & { code?: string };
    paused.code = 'WORKFLOW_PAUSED';
    throw paused;
  }
  if (triggerType === 'schedule' && workflow.isPaused) {
    const paused = new Error('Workflow is paused') as Error & { code?: string };
    paused.code = 'WORKFLOW_PAUSED';
    throw paused;
  }

  const execution = await prisma.execution.create({
    data: {
      workflowId,
      triggerType,
      status: 'pending',
      inputPayload: inputPayload ?? undefined,
    },
    select: { id: true },
  });

  await addWorkflowRunJob({
    executionId: execution.id,
    workflowId,
    triggerType,
    inputPayload: inputPayload ?? undefined,
  });
  return { executionId: execution.id, status: 'queued' };
}
