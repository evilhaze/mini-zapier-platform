import { Router } from 'express';
import { executionController } from '../controllers/execution.controller.js';

export const executionsRouter = Router();

executionsRouter.get('/', executionController.list);
executionsRouter.get('/:id', executionController.getById);
