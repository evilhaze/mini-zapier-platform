import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import { addWorkflowRunJob } from '../queue/index.js';

const workflowSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  isPaused: true,
  definitionJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type WorkflowCreateInput = {
  name: string;
  description?: string | null;
  status?: string;
  isPaused?: boolean;
  definitionJson: Prisma.InputJsonValue;
};

export type WorkflowUpdateInput = {
  name?: string;
  description?: string | null;
  status?: string;
  isPaused?: boolean;
  definitionJson?: Prisma.InputJsonValue;
};

type DefinitionJson = { nodes?: { type: string }[] };

function getTriggerType(definitionJson: unknown): string {
  const def = definitionJson as DefinitionJson | null;
  const nodes = def?.nodes ?? [];
  const trigger = nodes.find((n) =>
    ['webhook', 'schedule', 'manual', 'email'].includes(String(n.type))
  );
  return trigger ? String(trigger.type) : '—';
}

export type WorkflowWithStats = Awaited<ReturnType<typeof prisma.workflow.findMany>>[number] & {
  triggerType: string;
  lastRunAt: string | null;
  executionCount: number;
  successRate: number;
};

export const workflowService = {
  async findAll() {
    return prisma.workflow.findMany({
      select: workflowSelect,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findAllWithStats(): Promise<WorkflowWithStats[]> {
    const workflows = await prisma.workflow.findMany({
      select: workflowSelect,
      orderBy: { updatedAt: 'desc' },
    });
    if (workflows.length === 0) return [];
    const ids = workflows.map((w) => w.id);
    const executions = await prisma.execution.findMany({
      where: { workflowId: { in: ids } },
      select: { workflowId: true, status: true, finishedAt: true },
    });
    const byId = new Map<
      string,
      { total: number; success: number; lastRun: Date | null }
    >();
    for (const e of executions) {
      const cur = byId.get(e.workflowId) ?? {
        total: 0,
        success: 0,
        lastRun: null as Date | null,
      };
      cur.total += 1;
      if (e.status === 'success') cur.success += 1;
      if (e.finishedAt && (!cur.lastRun || e.finishedAt > cur.lastRun))
        cur.lastRun = e.finishedAt;
      byId.set(e.workflowId, cur);
    }
    return workflows.map((w) => {
      const s = byId.get(w.id);
      const total = s?.total ?? 0;
      const success = s?.success ?? 0;
      return {
        ...w,
        triggerType: getTriggerType(w.definitionJson),
        lastRunAt: s?.lastRun?.toISOString() ?? null,
        executionCount: total,
        successRate: total > 0 ? Math.round((success / total) * 100) / 100 : 0,
      };
    });
  },

  async findById(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      select: workflowSelect,
    });
  },

  async findByIdWithStats(id: string): Promise<WorkflowWithStats | null> {
    const list = await this.findAllWithStats();
    return list.find((w) => w.id === id) ?? null;
  },

  async create(data: WorkflowCreateInput) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description ?? null,
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
        ...(data.description !== undefined && { description: data.description }),
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

  /** Set workflow to paused. Scheduler should be unregistered by caller. */
  async pause(id: string) {
    return prisma.workflow.update({
      where: { id },
      data: { isPaused: true },
      select: workflowSelect,
    });
  },

  /** Set workflow to resumed (not paused). Caller should re-register scheduler if needed. */
  async resume(id: string) {
    return prisma.workflow.update({
      where: { id },
      data: { isPaused: false },
      select: workflowSelect,
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

  /**
   * Email trigger (inbound webhook): load workflow, find email trigger node, apply from/subject
   * filters. If filters pass, enqueue execution with email payload. If filters fail, return skipped.
   */
  async triggerByEmailInbound(
    workflowId: string,
    emailPayload: { from?: string; to?: string; subject?: string; text?: string; html?: string }
  ): Promise<{ executionId: string; status: 'queued' } | { skipped: true; reason: string }> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true, isPaused: true, definitionJson: true },
    });
    if (!workflow) {
      const notFound = new Error('Workflow not found') as Error & { code?: string };
      notFound.code = 'WORKFLOW_NOT_FOUND';
      throw notFound;
    }
    if (workflow.isPaused) {
      const paused = new Error('Workflow is paused') as Error & { code?: string };
      paused.code = 'WORKFLOW_PAUSED';
      throw paused;
    }

    const def = workflow.definitionJson as { nodes?: Array<{ type: string; config?: { from?: string; subjectFilter?: string } }> } | null;
    const nodes = def?.nodes ?? [];
    const emailTrigger = nodes.find((n) => String(n.type) === 'email');
    if (!emailTrigger) {
      const bad = new Error('Workflow does not have an email trigger') as Error & { code?: string };
      bad.code = 'WORKFLOW_NO_EMAIL_TRIGGER';
      throw bad;
    }

    const configFrom = typeof emailTrigger.config?.from === 'string' ? emailTrigger.config.from.trim() : '';
    const configSubjectFilter = typeof emailTrigger.config?.subjectFilter === 'string' ? emailTrigger.config.subjectFilter.trim() : '';

    if (configFrom) {
      const from = emailPayload.from != null ? String(emailPayload.from).trim() : '';
      if (!from || from.toLowerCase() !== configFrom.toLowerCase()) {
        return { skipped: true, reason: 'from_filter' };
      }
    }
    if (configSubjectFilter) {
      const subject = emailPayload.subject != null ? String(emailPayload.subject) : '';
      if (!subject || !subject.toLowerCase().includes(configSubjectFilter.toLowerCase())) {
        return { skipped: true, reason: 'subject_filter' };
      }
    }

    const inputPayload: Prisma.InputJsonValue = {
      from: emailPayload.from ?? null,
      to: emailPayload.to ?? null,
      subject: emailPayload.subject ?? null,
      text: emailPayload.text ?? null,
      html: emailPayload.html ?? null,
    };
    return enqueueExecution(workflowId, 'email', inputPayload);
  },
};

async function enqueueExecution(
  workflowId: string,
  triggerType: 'manual' | 'webhook' | 'schedule' | 'email',
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
  if (triggerType === 'email' && workflow.isPaused) {
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
