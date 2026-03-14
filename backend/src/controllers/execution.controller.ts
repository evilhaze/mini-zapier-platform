import type { Request, Response } from 'express';
import { z } from 'zod';
import { executionService } from '../services/execution.service.js';

const idParamSchema = z.object({
  id: z.string().uuid('invalid execution id'),
});

const listQuerySchema = z.object({
  workflowId: z.string().uuid().optional(),
  status: z.enum(['pending', 'running', 'success', 'failed', 'paused']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const workflowIdParamSchema = z.object({
  id: z.string().uuid('invalid workflow id'),
});

export const executionController = {
  /**
   * GET /api/executions — list with filters and pagination
   */
  async list(req: Request, res: Response) {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { workflowId, status, page, limit } = parsed.data;
    const result = await executionService.findAll(
      { workflowId, status },
      { page, limit }
    );
    res.status(200).json(result);
  },

  /**
   * GET /api/executions/:id — execution with steps and workflow basic info
   */
  async getById(req: Request, res: Response) {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const execution = await executionService.findById(parsed.data.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.status(200).json(execution);
  },

  /**
   * GET /api/workflows/:id/executions — list executions for a workflow
   */
  async listByWorkflow(req: Request, res: Response) {
    const parsed = workflowIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const queryParsed = listQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: queryParsed.error.flatten().fieldErrors });
    }
    const { status, page, limit } = queryParsed.data;
    const result = await executionService.findAll(
      { workflowId: parsed.data.id, status },
      { page, limit }
    );
    res.status(200).json(result);
  },
};
