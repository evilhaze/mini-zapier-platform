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

  await schedulerRegisterAll();

  const worker = getWorker(async (job) => {
    await runWorkflowExecution({
      executionId: job.data.executionId,
      workflowId: job.data.workflowId,
      triggerType: job.data.triggerType,
      inputPayload: job.data.inputPayload,
    });
  });
  worker.on('failed', (job, err) => {
    console.error('Workflow job failed', job?.id, err?.message);
  });

  app.listen(config.port, () => {
    console.log(`Server http://localhost:${config.port}`);
    console.log(`Swagger http://localhost:${config.port}/api-docs`);
  });
}

start();
