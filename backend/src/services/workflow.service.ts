import { prisma } from '../utils/prisma.js';
import type { Prisma } from '@prisma/client';

const workflowSelect = {
  id: true,
  name: true,
  status: true,
  isPaused: true,
  definitionJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type WorkflowCreateInput = {
  name: string;
  status?: string;
  isPaused?: boolean;
  definitionJson: Prisma.InputJsonValue;
};

export type WorkflowUpdateInput = {
  name?: string;
  status?: string;
  isPaused?: boolean;
  definitionJson?: Prisma.InputJsonValue;
};

export const workflowService = {
  async findAll() {
    return prisma.workflow.findMany({
      select: workflowSelect,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      select: workflowSelect,
    });
  },

  async create(data: WorkflowCreateInput) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        status: data.status ?? 'draft',
        isPaused: data.isPaused ?? false,
        definitionJson: data.definitionJson,
      },
      select: workflowSelect,
    });
  },

  async update(id: string, data: WorkflowUpdateInput) {
    return prisma.workflow.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isPaused !== undefined && { isPaused: data.isPaused }),
        ...(data.definitionJson !== undefined && { definitionJson: data.definitionJson }),
      },
      select: workflowSelect,
    });
  },

  async delete(id: string) {
    return prisma.workflow.delete({
      where: { id },
    });
  },
};
