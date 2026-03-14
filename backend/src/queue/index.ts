import { Queue, Worker, type Job } from 'bullmq';
import { config } from '../config/index.js';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null as number | null,
};

/** Job name for workflow run */
export const WORKFLOW_RUN_JOB_NAME = 'run';

/** Payload for a workflow execution job (consumer will load workflow + execution from DB) */
export type WorkflowRunJobPayload = {
  executionId: string;
  workflowId: string;
  triggerType: 'manual' | 'webhook' | 'schedule' | 'email';
  inputPayload?: unknown;
};

export const workflowQueue = new Queue<WorkflowRunJobPayload>('workflow-execution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export function addWorkflowRunJob(data: WorkflowRunJobPayload) {
  return workflowQueue.add(WORKFLOW_RUN_JOB_NAME, data, {
    jobId: `${data.executionId}`,
  });
}

export function getWorker(
  processor: (job: Job<WorkflowRunJobPayload>) => Promise<void>
) {
  return new Worker<WorkflowRunJobPayload>('workflow-execution', processor, {
    connection,
    concurrency: 5,
  });
}
