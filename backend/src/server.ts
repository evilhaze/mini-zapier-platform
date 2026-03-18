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
      });
    });

    if (!worker) {
      console.warn('[worker] Redis is not configured; worker is disabled');
    } else {
      worker.on('failed', (job, err) => {
        console.error('Workflow job failed', job?.id, err?.message);
      });
      worker.on('error', (err) => {
        console.error('[worker] error:', err?.message ?? err);
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
