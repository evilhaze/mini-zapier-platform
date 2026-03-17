import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateWorkflowFromPrompt } from '../services/ai.service.js';

export const aiRouter = Router();

const generateBodySchema = z.object({
  prompt: z.string().min(1, 'prompt is required').max(4000),
});

/**
 * POST /api/ai/generate-workflow
 * Input: { prompt }
 * Output: { name, description, definitionJson: { nodes, edges }, message? }
 */
aiRouter.post('/generate-workflow', (req: Request, res: Response) => {
  const parsed = generateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const draft = generateWorkflowFromPrompt(parsed.data.prompt);
    return res.status(200).json(draft);
  } catch (e) {
    return res.status(500).json({
      error: 'Failed to generate workflow',
      message: e instanceof Error ? e.message : 'Unknown error',
    });
  }
});
