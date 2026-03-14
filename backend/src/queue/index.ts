import { Queue, Worker, Job } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null as number | null,
};

export const workflowQueue = new Queue('workflow-execution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export type WorkflowJobData = {
  workflowId: string;
  triggerType: string;
  triggerPayload?: Record<string, unknown>;
};

export function addWorkflowJob(data: WorkflowJobData) {
  return workflowQueue.add('run', data, {
    jobId: data.workflowId + '-' + Date.now(),
  });
}

export function getWorker(processor: (job: Job<WorkflowJobData>) => Promise<void>) {
  return new Worker<WorkflowJobData>(
    'workflow-execution',
    processor,
    {
      connection,
      concurrency: 5,
    }
  );
}
