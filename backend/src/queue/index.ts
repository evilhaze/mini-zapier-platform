import { Queue, Worker, type Job } from 'bullmq';
import { config } from '../config/index.js';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null as number | null,
};

export const workflowQueue = new Queue('workflow-execution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

export function getWorker<T = unknown>(
  processor: (job: Job<T>) => Promise<void>
) {
  return new Worker<T>('workflow-execution', processor, {
    connection,
    concurrency: 5,
  });
}
