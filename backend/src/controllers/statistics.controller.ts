import type { Request, Response } from 'express';
import { statisticsService } from '../services/statistics.service.js';

export const statisticsController = {
  async overview(_req: Request, res: Response) {
    const stats = await statisticsService.getOverview();
    res.status(200).json(stats);
  },
};
