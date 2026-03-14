import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/index.js';
import { workflowsRouter } from './routes/workflows.js';
import { webhooksRouter } from './routes/webhooks.js';
import { executionsRouter } from './routes/executions.js';
import { getWorker } from './queue/index.js';
import { runWorkflow } from './engine/runner.js';
import { startScheduler } from './triggers/scheduler.js';
import { swaggerServe, swaggerSetup } from './swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/workflows', workflowsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/webhooks', webhooksRouter);

app.use('/api-docs', swaggerServe, swaggerSetup);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const worker = getWorker(async (job) => {
  const { workflowId, triggerType, triggerPayload } = job.data;
  const { db } = await import('./db/index.js');
  const row = db.prepare('SELECT definition FROM workflows WHERE id = ?').get(workflowId) as { definition: string } | undefined;
  if (!row) return;
  const definition = JSON.parse(row.definition);
  await runWorkflow(workflowId, definition, triggerType, triggerPayload);
});

worker.on('failed', (job, err) => {
  console.error('Job failed', job?.id, err?.message);
});

if (process.env.NODE_ENV !== 'test') {
  app.use(express.static(join(__dirname, '../../frontend/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '../../frontend/dist/index.html'));
  });
}

async function start() {
  const { initDb } = await import('./db/index.js');
  await initDb();
  startScheduler();
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT}`);
    console.log(`Swagger http://localhost:${PORT}/api-docs`);
  });
}
start();
