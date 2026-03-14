/**
 * MVP notifications on execution failed/paused: console + optional Telegram.
 * Configure in workflow definition: notifications.onFailure.telegram.{ chatId, botToken? }
 * botToken can be omitted and taken from env TELEGRAM_BOT_TOKEN.
 */

type DefinitionWithNotifications = {
  notifications?: {
    onFailure?: {
      telegram?: { chatId: string; botToken?: string };
    };
  };
};

function getTelegramConfig(def: unknown): { chatId: string; botToken: string } | null {
  const d = def as DefinitionWithNotifications;
  const tel = d?.notifications?.onFailure?.telegram;
  if (!tel?.chatId) return null;
  const token = (tel.botToken as string) || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  return { chatId: String(tel.chatId), botToken: token };
}

async function sendTelegram(botToken: string, chatId: string, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const data = (await res.json()) as { description?: string };
    console.error('[notification] Telegram send failed:', data.description ?? res.statusText);
  }
}

/**
 * Call when execution finishes with failed or paused. Logs to console and optionally sends Telegram.
 */
export async function onExecutionFailed(params: {
  workflowId: string;
  workflowName: string;
  executionId: string;
  status: 'failed' | 'paused';
  errorMessage: string;
  definitionJson: unknown;
}): Promise<void> {
  const { workflowId, workflowName, executionId, status, errorMessage, definitionJson } = params;

  const msg = `[workflow] ${status}: workflow=${workflowName} (${workflowId}) execution=${executionId} error=${errorMessage}`;
  console.error(msg);

  const telegram = getTelegramConfig(definitionJson);
  if (telegram) {
    const text = `Workflow ${status}\nWorkflow: ${workflowName}\nExecution: ${executionId}\nError: ${errorMessage}`;
    await sendTelegram(telegram.botToken, telegram.chatId, text);
  }
}
