import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import type { WorkflowDefinition, WorkflowNode, Edge } from './types.js';
import { runAction } from './actions.js';
import type { ActionNode } from './types.js';

function getNextNodes(nodeId: string, edges: Edge[]): string[] {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}

function getNodeById(nodes: WorkflowNode[], id: string): WorkflowNode | undefined {
  return nodes.find((n) => n.id === id);
}

function sortActionNodes(nodes: WorkflowNode[], edges: Edge[]): ActionNode[] {
  const trigger = nodes.find((n) => ['webhook', 'schedule', 'email'].includes(n.type));
  if (!trigger) return [];
  const ordered: ActionNode[] = [];
  const seen = new Set<string>();
  let current = [trigger.id];
  while (current.length) {
    const next: string[] = [];
    for (const id of current) {
      for (const targetId of getNextNodes(id, edges)) {
        if (seen.has(targetId)) continue;
        seen.add(targetId);
        const node = getNodeById(nodes, targetId);
        if (node && 'type' in node && !['webhook', 'schedule', 'email'].includes(node.type)) {
          ordered.push(node as ActionNode);
          next.push(targetId);
        }
      }
    }
    current = next;
  }
  return ordered;
}

export async function runWorkflow(
  workflowId: string,
  definition: WorkflowDefinition,
  triggerType: string,
  triggerPayload?: Record<string, unknown>
): Promise<string> {
  const executionId = uuid();
  const st = db.prepare(
    'INSERT INTO executions (id, workflow_id, trigger_type, status) VALUES (?, ?, ?, ?)'
  );
  st.run(executionId, workflowId, triggerType, 'running');

  let previousOutput: Record<string, unknown> = triggerPayload ?? {};
  const actionNodes = sortActionNodes(definition.nodes, definition.edges);
  const insertStep = db.prepare(`
    INSERT INTO execution_steps (execution_id, node_id, step_index, status, input_data, output_data, error_message, started_at, finished_at, retry_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
  `);
  const updateStep = db.prepare(`
    UPDATE execution_steps SET status = ?, output_data = ?, error_message = ?, finished_at = datetime('now') WHERE id = ?
  `);

  try {
    for (let i = 0; i < actionNodes.length; i++) {
      const node = actionNodes[i];
      const stepIndex = i + 1;
      const stepRow = db.prepare(
        "INSERT INTO execution_steps (execution_id, node_id, step_index, status, input_data, started_at, retry_count) VALUES (?, ?, ?, ?, ?, datetime('now'), 0)"
      ).run(executionId, node.id, stepIndex, 'running', JSON.stringify(previousOutput));
      const stepId = stepRow.lastInsertRowid as number;

      try {
        const output = await runAction(node, {
          executionId,
          workflowId,
          previousOutput,
          stepIndex,
        });
        previousOutput = output;
        updateStep.run('success', JSON.stringify(output), null, stepId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        updateStep.run('failed', null, msg, stepId);
        db.prepare('UPDATE executions SET status = ?, error_message = ?, finished_at = datetime(\'now\') WHERE id = ?')
          .run('failed', msg, executionId);
        return executionId;
      }
    }

    db.prepare('UPDATE executions SET status = ?, finished_at = datetime(\'now\') WHERE id = ?')
      .run('success', executionId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    db.prepare('UPDATE executions SET status = ?, error_message = ?, finished_at = datetime(\'now\') WHERE id = ?')
      .run('failed', msg, executionId);
  }

  return executionId;
}
