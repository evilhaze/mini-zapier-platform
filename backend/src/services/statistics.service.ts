import { prisma } from '../utils/prisma.js';

const RECENT_HOURS = 24;

export type OverviewStats = {
  totalWorkflows: number;
  activeWorkflows: number;
  pausedWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pausedExecutions: number;
  successRate: number;
  recentExecutionsCount: number;
};

export const statisticsService = {
  async getOverview(): Promise<OverviewStats> {
    const since = new Date(Date.now() - RECENT_HOURS * 60 * 60 * 1000);

    const [
      totalWorkflows,
      activeWorkflows,
      pausedWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      pausedExecutions,
      recentExecutionsCount,
    ] = await Promise.all([
      prisma.workflow.count(),
      prisma.workflow.count({ where: { status: 'active' } }),
      prisma.workflow.count({ where: { isPaused: true } }),
      prisma.execution.count(),
      prisma.execution.count({ where: { status: 'success' } }),
      prisma.execution.count({ where: { status: 'failed' } }),
      prisma.execution.count({ where: { status: 'paused' } }),
      prisma.execution.count({ where: { startedAt: { gte: since } } }),
    ]);

    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    return {
      totalWorkflows,
      activeWorkflows,
      pausedWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      pausedExecutions,
      successRate: Math.round(successRate * 100) / 100,
      recentExecutionsCount,
    };
  },
};
