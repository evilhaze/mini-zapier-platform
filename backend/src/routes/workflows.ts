import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller.js';

/**
 * @openapi
 * tags:
 *   name: Workflows
 *   description: Workflow CRUD
 */
export const workflowsRouter = Router();

workflowsRouter.get('/', workflowController.list);
workflowsRouter.get('/:id', workflowController.getById);
workflowsRouter.post('/', workflowController.create);
workflowsRouter.put('/:id', workflowController.update);
workflowsRouter.delete('/:id', workflowController.delete);
