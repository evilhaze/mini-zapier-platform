import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import { addWorkflowJob } from '../queue/index.js';
import { runWorkflow } from '../engine/runner.js';
import { registerSchedule, stopSchedule } from '../triggers/scheduler.js';

export const workflowsRouter = Router();

workflowsRouter.get('/', (req, res) => {
  const list = db.prepare(
    'SELECT id, name, description, definition, enabled, created_at, updated_at FROM workflows ORDER BY updated_at DESC'
  ).all();
  res.json(list);
});

workflowsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Workflow not found' });
  res.json(row);
});

workflowsRouter.post('/', (req, res) => {
  const id = uuid();
  const { name, description, definition, enabled = true } = req.body;
  if (!name || !definition) {
    return res.status(400).json({ error: 'name and definition required' });
  }
  db.prepare(
    'INSERT INTO workflows (id, name, description, definition, enabled) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, description ?? null, JSON.stringify(definition), enabled ? 1 : 0);
  const def = typeof definition === 'string' ? JSON.parse(definition) : definition;
  const scheduleNode = def.nodes?.find((n: { type: string }) => n.type === 'schedule');
  if (scheduleNode?.config?.cron) {
    registerSchedule(id, scheduleNode.config.cron);
  }
  res.status(201).json({ id, name, description, definition, enabled: !!enabled });
});

workflowsRouter.put('/:id', (req, res) => {
  const { name, description, definition, enabled } = req.body;
  const existing = db.prepare('SELECT id FROM workflows WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Workflow not found' });
  if (name !== undefined) {
    db.prepare('UPDATE workflows SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name, req.params.id);
  }
  if (description !== undefined) {
    db.prepare('UPDATE workflows SET description = ?, updated_at = datetime(\'now\') WHERE id = ?').run(description, req.params.id);
  }
  if (definition !== undefined) {
    db.prepare('UPDATE workflows SET definition = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      JSON.stringify(definition), req.params.id
    );
    stopSchedule(req.params.id);
    const def = typeof definition === 'string' ? JSON.parse(definition) : definition;
    const scheduleNode = def.nodes?.find((n: { type: string }) => n.type === 'schedule');
    if (scheduleNode?.config?.cron) {
      registerSchedule(req.params.id, scheduleNode.config.cron);
    }
  }
  if (enabled !== undefined) {
    db.prepare('UPDATE workflows SET enabled = ?, updated_at = datetime(\'now\') WHERE id = ?').run(enabled ? 1 : 0, req.params.id);
    if (!enabled) stopSchedule(req.params.id);
    else if (definition) {
      const def = typeof definition === 'string' ? JSON.parse(definition) : definition;
      const scheduleNode = def.nodes?.find((n: { type: string }) => n.type === 'schedule');
      if (scheduleNode?.config?.cron) registerSchedule(req.params.id, scheduleNode.config.cron);
    }
  }
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);
  res.json(row);
});

workflowsRouter.delete('/:id', (req, res) => {
  stopSchedule(req.params.id);
  const r = db.prepare('DELETE FROM workflows WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Workflow not found' });
  res.status(204).send();
});

workflowsRouter.post('/:id/run', (req, res) => {
  const row = db.prepare('SELECT id, definition FROM workflows WHERE id = ?').get(req.params.id) as { id: string; definition: string } | undefined;
  if (!row) return res.status(404).json({ error: 'Workflow not found' });
  const definition = JSON.parse(row.definition);
  runWorkflow(row.id, definition, 'manual', req.body).then((executionId) => {
    res.status(202).json({ executionId });
  }).catch((err) => {
    res.status(500).json({ error: err.message });
  });
});
