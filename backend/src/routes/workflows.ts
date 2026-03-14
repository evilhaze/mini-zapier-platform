import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller.js';
import { executionController } from '../controllers/execution.controller.js';

/**
 * @openapi
 * tags:
 *   name: Workflows
 *   description: Workflow CRUD
 */
export const workflowsRouter = Router();

workflowsRouter.get('/', workflowController.list);
workflowsRouter.post('/', workflowController.create);
workflowsRouter.get('/:id/executions', executionController.listByWorkflow);
workflowsRouter.post('/:id/pause', workflowController.pause);
workflowsRouter.post('/:id/resume', workflowController.resume);
workflowsRouter.post('/:id/run', workflowController.run);
workflowsRouter.get('/:id', workflowController.getById);
workflowsRouter.put('/:id', workflowController.update);
workflowsRouter.delete('/:id', workflowController.delete);
