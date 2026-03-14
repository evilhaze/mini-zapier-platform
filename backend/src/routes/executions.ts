import { Router } from 'express';
import { db } from '../db/index.js';

export const executionsRouter = Router();

executionsRouter.get('/', (req, res) => {
  const workflowId = req.query.workflowId as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  let list;
  if (workflowId) {
    list = db.prepare(
      'SELECT * FROM executions WHERE workflow_id = ? ORDER BY started_at DESC LIMIT ?'
    ).all(workflowId, limit);
  } else {
    list = db.prepare(
      'SELECT * FROM executions ORDER BY started_at DESC LIMIT ?'
    ).all(limit);
  }
  res.json(list);
});

executionsRouter.get('/stats', (req, res) => {
  const workflowId = req.query.workflowId as string | undefined;
  let stats: { total: number; success: number; failed: number };
  if (workflowId) {
    const row = db.prepare(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM executions WHERE workflow_id = ?
    `).get(workflowId) as { total: number; success: number; failed: number };
    stats = row;
  } else {
    const row = db.prepare(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM executions
    `).get() as { total: number; success: number; failed: number };
    stats = row;
  }
  res.json(stats);
});

executionsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM executions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Execution not found' });
  res.json(row);
});

executionsRouter.get('/:id/steps', (req, res) => {
  const steps = db.prepare(
    'SELECT * FROM execution_steps WHERE execution_id = ? ORDER BY step_index'
  ).all(req.params.id);
  res.json(steps);
});
