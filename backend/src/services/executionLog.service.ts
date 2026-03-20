import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

export type StepStartInput = {
  nodeId: string;
  nodeName?: string;
  nodeType: string;
  inputData: Prisma.InputJsonValue;
};

export type StepSuccessInput = {
  outputData: Prisma.InputJsonValue;
  retryCount: number;
};

export type StepFailureInput = {
  errorMessage: string;
  retryCount: number;
};

export type FinishExecutionInput = {
  status: 'success' | 'failed' | 'paused';
  outputPayload?: Prisma.InputJsonValue;
  errorMessage?: string;
};

/**
 * Centralized execution logging: execution status + step records.
 * All step fields (nodeId, nodeName, nodeType, inputData, outputData, status, errorMessage, retryCount, startedAt, finishedAt) are written here.
 */
export const executionLogService = {
  /**
   * Transition execution from pending -> running.
   * Returns `true` when transition happened, `false` when execution was not pending anymore
   * (already running / already finished), which helps prevent duplicate processing.
   */
  async startExecution(executionId: string): Promise<boolean> {
    const result = await prisma.execution.updateMany({
      where: { id: executionId, status: 'pending' },
      data: { status: 'running' },
    });
    return result.count > 0;
  },

  /**
   * Create (or reuse) step record for given execution+node.
   * This prevents uncontrolled duplication when BullMQ retries the same execution job.
   */
  async createStep(executionId: string, input: StepStartInput): Promise<{ id: string }> {
    const existing = await prisma.executionStep.findFirst({
      where: { executionId, nodeId: input.nodeId },
      orderBy: { startedAt: 'desc' },
      select: { id: true },
    });

    if (existing) {
      await prisma.executionStep.update({
        where: { id: existing.id },
        data: {
          nodeName: input.nodeName ?? null,
          nodeType: input.nodeType,
          status: 'running',
          inputData: input.inputData,
          retryCount: 0,
          errorMessage: null,
          startedAt: new Date(),
          finishedAt: null,
        },
      });
      return { id: existing.id };
    }

    const step = await prisma.executionStep.create({
      data: {
        executionId,
        nodeId: input.nodeId,
        nodeName: input.nodeName ?? null,
        nodeType: input.nodeType,
        status: 'running',
        inputData: input.inputData,
        retryCount: 0,
      },
      select: { id: true },
    });
    return step;
  },

  /** Mark step success: outputData, status=success, finishedAt, retryCount. */
  async completeStepSuccess(
    stepId: string,
    input: StepSuccessInput
  ): Promise<void> {
    await prisma.executionStep.update({
      where: { id: stepId },
      data: {
        status: 'success',
        outputData: input.outputData,
        errorMessage: null,
        finishedAt: new Date(),
        retryCount: input.retryCount,
      },
    });
  },

  /** Mark step failed: errorMessage, status=failed, finishedAt, retryCount. */
  async completeStepFailure(stepId: string, input: StepFailureInput): Promise<void> {
    await prisma.executionStep.update({
      where: { id: stepId },
      data: {
        status: 'failed',
        errorMessage: input.errorMessage,
        finishedAt: new Date(),
        retryCount: input.retryCount,
      },
    });
  },

  /** Update step retry count only (before next retry). */
  async updateStepRetry(stepId: string, retryCount: number): Promise<void> {
    await prisma.executionStep.update({
      where: { id: stepId },
      data: { retryCount },
    });
  },

  /**
   * Finish execution: status (success | failed | paused), finishedAt, optional outputPayload and errorMessage.
   */
  async finishExecution(executionId: string, input: FinishExecutionInput): Promise<void> {
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: input.status,
        finishedAt: new Date(),
        ...(input.outputPayload !== undefined && { outputPayload: input.outputPayload }),
        ...(input.errorMessage !== undefined && { errorMessage: input.errorMessage }),
      },
    });
  },

  /** Fail execution early (e.g. workflow paused, no trigger). */
  async failExecutionEarly(executionId: string, errorMessage: string): Promise<void> {
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        errorMessage,
        finishedAt: new Date(),
      },
    });
  },
};
