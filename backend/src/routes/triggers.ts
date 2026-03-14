import { Router } from 'express';
import { triggerController } from '../controllers/trigger.controller.js';

export const triggersRouter = Router();

triggersRouter.post('/webhook/:workflowId', triggerController.webhook);
