import type { ActionHandler, ActionContext } from './types.js';
import { httpHandler } from './handlers/http.js';
import { emailHandler } from './handlers/email.js';
import { telegramHandler } from './handlers/telegram.js';
import { dbHandler } from './handlers/db.js';
import { transformHandler } from './handlers/transform.js';

const handlers: Record<string, ActionHandler> = {
  http: httpHandler,
  email: emailHandler,
  telegram: telegramHandler,
  db: dbHandler,
  transform: transformHandler,
};

export type { ActionHandler, ActionContext } from './types.js';
export { httpHandler, emailHandler, telegramHandler, dbHandler, transformHandler } from './handlers/index.js';

/**
 * Dispatch to the right action handler by type.
 */
export function dispatchAction(
  actionType: string,
  config: Record<string, unknown>,
  input: unknown,
  context?: ActionContext
): Promise<Record<string, unknown>> {
  const handler = handlers[actionType];
  if (!handler) throw new Error(`Unknown action type: ${actionType}`);
  return handler(config, input, context);
}
