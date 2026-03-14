import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { workflowService, type WorkflowUpdateInput } from '../services/workflow.service.js';

const createBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  isPaused: z.boolean().optional().default(false),
  definitionJson: z.record(z.unknown()),
});

const updateBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  isPaused: z.boolean().optional(),
  definitionJson: z.record(z.unknown()).optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid('invalid workflow id'),
});

export const workflowController = {
  /**
   * @openapi
   * /workflows:
   *   get:
   *     summary: List all workflows
   *     tags: [Workflows]
   *     responses:
   *       200:
   *         description: List of workflows
   */
  async list(_req: Request, res: Response) {
    const workflows = await workflowService.findAll();
    res.status(200).json(workflows);
  },

  /**
   * @openapi
   * /workflows/{id}:
   *   get:
   *     summary: Get workflow by id
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Workflow found
   *       404:
   *         description: Workflow not found
   */
  async getById(req: Request, res: Response) {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const workflow = await workflowService.findById(parsed.data.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(200).json(workflow);
  },

  /**
   * @openapi
   * /workflows:
   *   post:
   *     summary: Create workflow
   *     tags: [Workflows]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, definitionJson]
   *             properties:
   *               name: { type: string }
   *               status: { type: string, enum: [draft, active, archived] }
   *               isPaused: { type: boolean }
   *               definitionJson: { type: object, description: nodes + edges }
   *     responses:
   *       201:
   *         description: Workflow created
   *       400:
   *         description: Validation error
   */
  async create(req: Request, res: Response) {
    const parsed = createBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const workflow = await workflowService.create({
      ...parsed.data,
      definitionJson: parsed.data.definitionJson as Prisma.InputJsonValue,
    });
    res.status(201).json(workflow);
  },

  /**
   * @openapi
   * /workflows/{id}:
   *   put:
   *     summary: Update workflow
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               status: { type: string, enum: [draft, active, archived] }
   *               isPaused: { type: boolean }
   *               definitionJson: { type: object }
   *     responses:
   *       200:
   *         description: Workflow updated
   *       400:
   *         description: Validation error
   *       404:
   *         description: Workflow not found
   */
  async update(req: Request, res: Response) {
    const paramParsed = idParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({ error: paramParsed.error.flatten().fieldErrors });
    }
    const bodyParsed = updateBodySchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: bodyParsed.error.flatten().fieldErrors });
    }
    try {
      const updateData: WorkflowUpdateInput = {
        ...bodyParsed.data,
        definitionJson: bodyParsed.data.definitionJson as Prisma.InputJsonValue | undefined,
      };
      const workflow = await workflowService.update(paramParsed.data.id, updateData);
      res.status(200).json(workflow);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      throw e;
    }
  },

  /**
   * @openapi
   * /workflows/{id}:
   *   delete:
   *     summary: Delete workflow
   *     tags: [Workflows]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       204:
   *         description: Workflow deleted
   *       400:
   *         description: Invalid id
   *       404:
   *         description: Workflow not found
   */
  async delete(req: Request, res: Response) {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    try {
      await workflowService.delete(parsed.data.id);
      res.status(204).send();
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      throw e;
    }
  },
};
