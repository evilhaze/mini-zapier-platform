import cron from 'node-cron';
import { prisma } from '../utils/prisma.js';
import { workflowService } from './workflow.service.js';

type Definition = {
  nodes?: { type: string; config?: { cron?: string } }[];
};

const tasks = new Map<string, cron.ScheduledTask>();

function getCronFromDefinition(definitionJson: unknown): string | null {
  const def = definitionJson as Definition | null;
  const nodes = def?.nodes ?? [];
  const scheduleNode = nodes.find((n) => n.type === 'schedule');
  const cronExpr = scheduleNode?.config?.cron;
  if (typeof cronExpr !== 'string' || !cron.validate(cronExpr)) return null;
  return cronExpr;
}

/**
 * Load workflows that have a schedule trigger with valid cron and are not paused.
 */
export async function getWorkflowsWithSchedule(): Promise<{ id: string; cron: string }[]> {
  const list = await prisma.workflow.findMany({
    where: { isPaused: false },
    select: { id: true, definitionJson: true },
  });
  const out: { id: string; cron: string }[] = [];
  for (const w of list) {
    const cronExpr = getCronFromDefinition(w.definitionJson);
    if (cronExpr) out.push({ id: w.id, cron: cronExpr });
  }
  return out;
}

/**
 * Unregister cron for a workflow (e.g. on delete or when schedule removed).
 */
export function unregister(workflowId: string): void {
  const task = tasks.get(workflowId);
  if (task) {
    task.stop();
    tasks.delete(workflowId);
    console.log(`[scheduler] unregistered workflow ${workflowId}`);
  }
}

/**
 * Register or re-register cron for one workflow. Call after create/update.
 * If workflow has no valid schedule trigger or is paused, unregisters.
 */
export async function register(workflowId: string): Promise<void> {
  unregister(workflowId);

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { id: true, isPaused: true, definitionJson: true },
  });
  if (!workflow || workflow.isPaused) return;

  const cronExpr = getCronFromDefinition(workflow.definitionJson);
  if (!cronExpr) return;

  const task = cron.schedule(cronExpr, async () => {
    const w = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true, isPaused: true },
    });
    if (!w || w.isPaused) {
      console.log(`[scheduler] skip workflow ${workflowId} (missing or paused)`);
      return;
    }
    try {
      const { executionId } = await workflowService.triggerBySchedule(workflowId);
      console.log(`[scheduler] triggered workflow ${workflowId} -> execution ${executionId}`);
    } catch (err) {
      console.error(`[scheduler] workflow ${workflowId} error:`, (err as Error).message);
    }
  });
  tasks.set(workflowId, task);
  console.log(`[scheduler] registered workflow ${workflowId} cron=${cronExpr}`);
}

/**
 * Register cron for all active workflows with schedule trigger. Call on app start.
 */
export async function registerAll(): Promise<void> {
  const list = await getWorkflowsWithSchedule();
  for (const { id } of list) {
    await register(id);
  }
  console.log(`[scheduler] loaded ${list.length} schedule(s)`);
}
