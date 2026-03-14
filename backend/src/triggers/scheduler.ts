import cron from 'node-cron';
import { db } from '../db/index.js';
import { addWorkflowJob } from '../queue/index.js';

let scheduled: Map<string, cron.ScheduledTask> = new Map();

export function startScheduler() {
  const workflows = db.prepare(
    "SELECT id, definition FROM workflows WHERE enabled = 1 AND definition LIKE '%\"type\":\"schedule\"%'"
  ).all() as { id: string; definition: string }[];

  for (const w of workflows) {
    try {
      const def = JSON.parse(w.definition) as { nodes: { type: string; config: { cron?: string } }[] };
      const scheduleNode = def.nodes?.find((n: { type: string }) => n.type === 'schedule');
      const cronExpr = scheduleNode?.config?.cron as string;
      if (!cronExpr || !cron.validate(cronExpr)) continue;
      const task = cron.schedule(cronExpr, () => {
        addWorkflowJob({ workflowId: w.id, triggerType: 'schedule' });
      });
      scheduled.set(w.id, task);
    } catch {
      // skip invalid
    }
  }
}

export function registerSchedule(workflowId: string, cronExpr: string) {
  stopSchedule(workflowId);
  if (!cron.validate(cronExpr)) return;
  const task = cron.schedule(cronExpr, () => {
    addWorkflowJob({ workflowId, triggerType: 'schedule' });
  });
  scheduled.set(workflowId, task);
}

export function stopSchedule(workflowId: string) {
  const task = scheduled.get(workflowId);
  if (task) {
    task.stop();
    scheduled.delete(workflowId);
  }
}
