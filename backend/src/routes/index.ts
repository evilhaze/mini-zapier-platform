import { Router } from 'express';
import { healthRouter } from './health.js';
import { workflowsRouter } from './workflows.js';
import { executionsRouter } from './executions.js';
import { statisticsRouter } from './statistics.js';
import { triggersRouter } from './triggers.js';

export const routes = Router();

routes.use(healthRouter);
routes.use('/workflows', workflowsRouter);
routes.use('/executions', executionsRouter);
routes.use('/statistics', statisticsRouter);
routes.use('/triggers', triggersRouter);
