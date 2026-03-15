import { Router } from 'express';
import { healthRouter } from './health.js';
import { workflowsRouter } from './workflows.js';
import { executionsRouter } from './executions.js';
import { statisticsRouter } from './statistics.js';
import { triggersRouter } from './triggers.js';

export const routes = Router();

// Path-prefixed routers first so req.path is stripped correctly in sub-routers.
// (healthRouter with no path was receiving all requests first; GET /executions/:id
// could then see path "/executions/:id" in executionsRouter and param id = "executions".)
routes.use('/workflows', workflowsRouter);
routes.use('/executions', executionsRouter);
routes.use('/statistics', statisticsRouter);
routes.use('/triggers', triggersRouter);
routes.use(healthRouter);
