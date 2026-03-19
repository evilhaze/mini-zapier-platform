import { Router } from 'express';
import { triggerController } from '../controllers/trigger.controller.js';

export const triggersRouter = Router();

triggersRouter.post('/webhook/:workflowId', triggerController.webhook);
triggersRouter.post('/email/:workflowId', triggerController.email);
triggersRouter.post('/email/postmark/:workflowId', triggerController.emailPostmark);
