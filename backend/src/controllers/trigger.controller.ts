import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { workflowService } from '../services/workflow.service.js';

const workflowIdParamSchema = z.object({
  workflowId: z.string().uuid('invalid workflow id'),
});

/**
 * POST /api/triggers/webhook/:workflowId
 * Body: any JSON (saved as inputPayload).
 * Returns: 202 { executionId, status: 'queued' } or 400/404/423.
 */
export const triggerController = {
  async webhook(req: Request, res: Response) {
    const paramParsed = workflowIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({
        error: 'Invalid workflow id',
        details: paramParsed.error.flatten().fieldErrors,
      });
    }

    const payload: Prisma.InputJsonValue = req.body != null && typeof req.body === 'object'
      ? req.body
      : req.body === undefined || req.body === null
        ? {}
        : { value: req.body };

    try {
      const result = await workflowService.triggerByWebhook(
        paramParsed.data.workflowId,
        payload
      );
      return res.status(202).json(result);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      if (err.code === 'WORKFLOW_NOT_FOUND') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      if (err.code === 'WORKFLOW_PAUSED') {
        return res.status(423).json({ error: 'Workflow is paused' });
      }
      if (err.message?.includes('ECONNREFUSED') || err.message?.includes('Redis')) {
        return res.status(503).json({ error: 'Queue unavailable' });
      }
      throw e;
    }
  },
};
