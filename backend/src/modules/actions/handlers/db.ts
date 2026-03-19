import { prisma } from '../../../utils/prisma.js';
import type { Prisma } from '@prisma/client';
import type { ActionHandler } from '../types.js';

const DB_ACTION_TIMEOUT_MS = 15_000;

function getValueByPath(obj: unknown, path: string): unknown {
  const trimmed = path.trim();
  if (!trimmed) return obj;
  const parts = trimmed.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
        ms
      )
    ),
  ]);
}

/**
 * DB action: saves payload into DataRecord.
 * - "What should be saved?" = optional key/path (e.g. "message" or "data.body"). Empty = save full input.
 * - If path is set but not found in input, throws a clear error (step fails, does not hang).
 * - Uses a timeout so the step never stays "running" indefinitely.
 */
export const dbHandler: ActionHandler = async (config, input, context) => {
  const logPrefix = context
    ? `[db action wf=${context.workflowId} ex=${context.executionId}]`
    : '[db action]';

  if (!context) {
    console.error(`${logPrefix} missing context`);
    throw new Error('db action: workflow/execution context is required');
  }

  const pathConfig =
    (typeof config.mapping === 'string' ? config.mapping : null) ??
    (typeof config.payload === 'string' ? config.payload : null) ??
    '';
  const pathKey = pathConfig.trim();

  let payload: unknown;
  if (!pathKey) {
    payload = input;
    console.log(`${logPrefix} saving full payload (no path)`);
  } else {
    const value = getValueByPath(input, pathKey);
    if (value === undefined) {
      const msg = `Key/path "${pathKey}" not found in payload. Use a valid key or leave empty to save everything.`;
      console.error(`${logPrefix} ${msg}`);
      throw new Error(msg);
    }
    payload = value;
    console.log(`${logPrefix} saving value at path "${pathKey}"`);
  }

  const data: Prisma.InputJsonValue =
    payload !== undefined && payload !== null ? (payload as Prisma.InputJsonValue) : {};

  try {
    const record = await withTimeout(
      prisma.dataRecord.create({
        data: {
          workflowId: context.workflowId,
          executionId: context.executionId,
          payload: data,
        },
      }),
      DB_ACTION_TIMEOUT_MS,
      'DB action'
    );
    console.log(`${logPrefix} saved record id=${record.id}`);
    return { id: record.id, createdAt: record.createdAt.toISOString() };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${logPrefix} failed: ${msg}`);
    throw err;
  }
};
