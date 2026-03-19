import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { workflowService } from '../services/workflow.service.js';
import { mapPostmarkInboundToInternal, type PostmarkInboundPayload } from '../adapters/postmarkInbound.js';

const workflowIdParamSchema = z.object({
  workflowId: z.string().uuid('invalid workflow id'),
});

const emailInboundBodySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
}).strict();

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

  /**
   * POST /api/triggers/email/:workflowId
   * Body: JSON { from?, to?, subject?, text?, html? }. Filters from email trigger config apply.
   * Returns: 202 { executionId, status: 'queued' } when run; 200 { skipped: true, reason } when filtered out.
   */
  async email(req: Request, res: Response) {
    const paramParsed = workflowIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({
        error: 'Invalid workflow id',
        details: paramParsed.error.flatten().fieldErrors,
      });
    }

    const bodyParsed = emailInboundBodySchema.safeParse(req.body ?? {});
    if (!bodyParsed.success) {
      return res.status(400).json({
        error: 'Invalid body',
        details: bodyParsed.error.flatten().fieldErrors,
      });
    }

    try {
      const result = await workflowService.triggerByEmailInbound(
        paramParsed.data.workflowId,
        bodyParsed.data
      );
      if ('skipped' in result && result.skipped) {
        return res.status(200).json(result);
      }
      return res.status(202).json(result);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      if (err.code === 'WORKFLOW_NOT_FOUND') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      if (err.code === 'WORKFLOW_PAUSED') {
        return res.status(423).json({ error: 'Workflow is paused' });
      }
      if (err.code === 'WORKFLOW_NO_EMAIL_TRIGGER') {
        return res.status(400).json({ error: 'Workflow does not have an email trigger' });
      }
      if (err.message?.includes('ECONNREFUSED') || err.message?.includes('Redis')) {
        return res.status(503).json({ error: 'Queue unavailable' });
      }
      throw e;
    }
  },

  /**
   * POST /api/triggers/email/postmark/:workflowId
   * Accepts Postmark inbound webhook JSON, maps to { from, to, subject, text, html }, then runs email trigger logic.
   * Optional: ?secret=... must match POSTMARK_INBOUND_SECRET (Postmark does not sign inbound webhooks).
   */
  async emailPostmark(req: Request, res: Response) {
    const paramParsed = workflowIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({
        error: 'Invalid workflow id',
        details: paramParsed.error.flatten().fieldErrors,
      });
    }

    const inboundSecret = process.env.POSTMARK_INBOUND_SECRET;
    if (inboundSecret != null && inboundSecret !== '') {
      const provided = (req.query?.secret ?? req.headers['x-postmark-inbound-secret']) as string | undefined;
      if (provided !== inboundSecret) {
        return res.status(403).json({ error: 'Invalid or missing webhook secret' });
      }
    }

    const body = req.body;
    if (body == null || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid body: expected Postmark inbound JSON object' });
    }

    const mapped = mapPostmarkInboundToInternal(body as PostmarkInboundPayload);

    try {
      const result = await workflowService.triggerByEmailInbound(
        paramParsed.data.workflowId,
        mapped
      );
      if ('skipped' in result && result.skipped) {
        return res.status(200).json(result);
      }
      return res.status(202).json(result);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      if (err.code === 'WORKFLOW_NOT_FOUND') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      if (err.code === 'WORKFLOW_PAUSED') {
        return res.status(423).json({ error: 'Workflow is paused' });
      }
      if (err.code === 'WORKFLOW_NO_EMAIL_TRIGGER') {
        return res.status(400).json({ error: 'Workflow does not have an email trigger' });
      }
      if (err.message?.includes('ECONNREFUSED') || err.message?.includes('Redis')) {
        return res.status(503).json({ error: 'Queue unavailable' });
      }
      throw e;
    }
  },
};
