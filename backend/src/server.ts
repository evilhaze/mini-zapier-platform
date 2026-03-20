import { createApp } from './app.js';
import { config } from './config/index.js';
import { prisma } from './utils/prisma.js';
import { getWorker } from './queue/index.js';
import { runWorkflowExecution } from './services/workflowRunner.js';
import { registerAll as schedulerRegisterAll } from './services/scheduler.service.js';

async function start() {
  const app = createApp();

  try {
    await prisma.$connect();
  } catch (e) {
    console.error('DB connect failed:', e);
    process.exit(1);
  }

  try {
    await schedulerRegisterAll();
  } catch (e) {
    console.error('Scheduler registerAll failed (server will still start):', (e as Error).message);
  }

  // Start background worker. Redis outages should not prevent API from starting.
  try {
    const worker = getWorker(async (job) => {
      await runWorkflowExecution({
        executionId: job.data.executionId,
        workflowId: job.data.workflowId,
        triggerType: job.data.triggerType,
        inputPayload: job.data.inputPayload,
        jobId: job.id,
        jobAttempt: (job.attemptsMade ?? 0) + 1,
      });
    });

    if (!worker) {
      console.warn('[worker] Redis is not configured; worker is disabled');
    } else {
      worker.on('completed', (job) => {
        console.log(
          `[worker] completed jobId=${job?.id} attemptsMade=${job?.attemptsMade ?? 0}`
        );
      });
      worker.on('failed', (job, err) => {
        console.error(
          `[worker] failed jobId=${job?.id} attemptsMade=${job?.attemptsMade ?? 0} error=${err?.message}`
        );
      });
      worker.on('error', (err) => {
        console.error('[worker] error:', err?.message ?? err);
      });

      // Some BullMQ event names might not exist in typings; keep it best-effort.
      (worker as any).on('stalled', (jobId: string) => {
        console.warn(`[worker] stalled jobId=${jobId}`);
      });
    }
  } catch (e) {
    console.error('Worker init failed (server will still start):', (e as Error).message);
  }

  app.listen(config.port, () => {
    console.log(`Server http://localhost:${config.port}`);
    console.log(`Swagger http://localhost:${config.port}/api-docs`);
  });
}

start();
