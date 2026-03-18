import { Queue, Worker, type Job } from 'bullmq';
import { config } from '../config/index.js';

const connection = config.redis.enabled
  ? config.redis.url
    ? // Use ioredis url (supports rediss://, auth, db selection, etc.)
      { url: config.redis.url, maxRetriesPerRequest: null as number | null }
    : {
        // host/port form
        host: config.redis.host,
        port: config.redis.port,
        maxRetriesPerRequest: null as number | null,
      }
  : null;

/** Job name for workflow run */
export const WORKFLOW_RUN_JOB_NAME = 'run';

/** Payload for a workflow execution job (consumer will load workflow + execution from DB) */
export type WorkflowRunJobPayload = {
  executionId: string;
  workflowId: string;
  triggerType: 'manual' | 'webhook' | 'schedule' | 'email';
  inputPayload?: unknown;
};

let workflowQueue: Queue<WorkflowRunJobPayload> | null = null;

if (connection) {
  workflowQueue = new Queue<WorkflowRunJobPayload>('workflow-execution', {
    connection,
    skipWaitingForReady: true,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    },
  });

  // Prevent Redis connection issues from crashing the server process.
  workflowQueue.on('error', (err) => {
    console.error('[queue] error:', err?.message ?? err);
  });
}

export function addWorkflowRunJob(data: WorkflowRunJobPayload) {
  if (!workflowQueue) {
    // Avoid crashing the whole server during startup when Redis isn't configured/available.
    throw new Error('Redis queue is not configured/available');
  }
  return workflowQueue.add(WORKFLOW_RUN_JOB_NAME, data, { jobId: `${data.executionId}` });
}

export function getWorker(
  processor: (job: Job<WorkflowRunJobPayload>) => Promise<void>
) {
  if (!connection) return null;
  return new Worker<WorkflowRunJobPayload>('workflow-execution', processor, {
    connection,
    concurrency: 5,
    skipWaitingForReady: true,
  });
}
