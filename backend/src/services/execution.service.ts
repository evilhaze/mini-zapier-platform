import { prisma } from '../utils/prisma.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

export type ExecutionListFilters = {
  workflowId?: string;
  status?: string;
};

export type ExecutionListPagination = {
  page?: number;
  limit?: number;
};

export type ExecutionListResult = {
  data: Awaited<ReturnType<typeof prisma.execution.findMany>>;
  total: number;
  page: number;
  limit: number;
};

export const executionService = {
  async findAll(
    filters: ExecutionListFilters = {},
    pagination: ExecutionListPagination = {}
  ): Promise<ExecutionListResult> {
    const page = Math.max(1, Number(pagination.page) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(pagination.limit) || DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const where: { workflowId?: string; status?: string } = {};
    if (filters.workflowId) where.workflowId = filters.workflowId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
        include: {
          workflow: { select: { id: true, name: true } },
        },
      }),
      prisma.execution.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  async findById(id: string) {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { startedAt: 'asc' },
        },
        workflow: {
          select: {
            id: true,
            name: true,
            status: true,
            isPaused: true,
          },
        },
      },
    });
    return execution;
  },
};
