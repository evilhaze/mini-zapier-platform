import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller.js';

export const statisticsRouter = Router();

statisticsRouter.get('/overview', statisticsController.overview);
