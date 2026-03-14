import { Router } from 'express';
import { db } from '../db/index.js';
import { addWorkflowJob } from '../queue/index.js';

export const webhooksRouter = Router();

webhooksRouter.post('/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  const row = db.prepare('SELECT id, enabled FROM workflows WHERE id = ?').get(workflowId) as { id: string; enabled: number } | undefined;
  if (!row) return res.status(404).json({ error: 'Workflow not found' });
  if (row.enabled !== 1) return res.status(403).json({ error: 'Workflow disabled' });
  addWorkflowJob({
    workflowId,
    triggerType: 'webhook',
    triggerPayload: { body: req.body, headers: req.headers as Record<string, string>, query: req.query },
  });
  res.status(202).json({ accepted: true });
});
