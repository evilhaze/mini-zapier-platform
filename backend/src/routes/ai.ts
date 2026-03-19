import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateWorkflowFromPrompt, handleEditorCommand } from '../services/ai.service.js';

export const aiRouter = Router();

const generateBodySchema = z.object({
  prompt: z.string().min(1, 'prompt is required').max(4000),
});

const editorCommandBodySchema = z.object({
  definitionJson: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        config: z.record(z.unknown()).optional(),
        name: z.string().optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
      })
    ),
    edges: z.array(z.object({ source: z.string(), target: z.string() })),
  }),
  prompt: z.string().min(1, 'prompt is required').max(2000),
  selectedNodeId: z.string().nullable().optional(),
});

/**
 * POST /api/ai/generate-workflow
 * Input: { prompt }
 * Output: { name, description, definitionJson, summary?, missingFields?, message? }
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

/**
 * POST /api/ai/editor-command
 * Input: { definitionJson: { nodes, edges }, prompt, selectedNodeId? }
 * Output: { type: 'explain' | 'missing_fields' | 'apply_operations', summary?, missingFields?, operations? }
 */
aiRouter.post('/editor-command', (req: Request, res: Response) => {
  const parsed = editorCommandBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  try {
    const result = handleEditorCommand({
      definitionJson: parsed.data.definitionJson,
      prompt: parsed.data.prompt,
      selectedNodeId: parsed.data.selectedNodeId ?? null,
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      error: 'Editor command failed',
      message: e instanceof Error ? e.message : 'Unknown error',
    });
  }
});
