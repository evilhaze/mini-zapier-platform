import { prisma } from '../../../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import type { ActionHandler } from '../types.js';

/**
 * DB action: saves payload into DataRecord.
 * Requires context (workflowId, executionId). Payload = input or config.payload.
 */
export const dbHandler: ActionHandler = async (config, input, context) => {
  if (!context) throw new Error('db action: workflow/execution context is required');

  const payload = (config.payload !== undefined ? config.payload : input) as Prisma.InputJsonValue;
  const record = await prisma.dataRecord.create({
    data: {
      workflowId: context.workflowId,
      executionId: context.executionId,
      payload,
    },
  });
  return { id: record.id, createdAt: record.createdAt.toISOString() };
};
