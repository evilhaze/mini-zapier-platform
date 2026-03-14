import { Router } from 'express';
import { healthRouter } from './health.js';
import { workflowsRouter } from './workflows.js';

export const routes = Router();

routes.use(healthRouter);
routes.use('/workflows', workflowsRouter);
