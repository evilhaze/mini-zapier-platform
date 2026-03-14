import { Router } from 'express';
import { healthRouter } from './health.js';
import { workflowsRouter } from './workflows.js';
import { triggersRouter } from './triggers.js';

export const routes = Router();

routes.use(healthRouter);
routes.use('/workflows', workflowsRouter);
routes.use('/triggers', triggersRouter);
