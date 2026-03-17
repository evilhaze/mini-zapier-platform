import { Router } from 'express';
import { healthRouter } from './health.js';
import { workflowsRouter } from './workflows.js';
import { executionsRouter } from './executions.js';
import { statisticsRouter } from './statistics.js';
import { triggersRouter } from './triggers.js';
import { aiRouter } from './ai.js';

export const routes = Router();

routes.use('/workflows', workflowsRouter);
routes.use('/executions', executionsRouter);
routes.use('/statistics', statisticsRouter);
routes.use('/triggers', triggersRouter);
routes.use('/ai', aiRouter);
routes.use(healthRouter);
