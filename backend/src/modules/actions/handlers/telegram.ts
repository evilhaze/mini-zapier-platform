import type { ActionHandler } from '../types.js';

/**
 * Telegram action: botToken, chatId, text.
 * Sends message via Telegram Bot API.
 */
export const telegramHandler: ActionHandler = async (config, input) => {
  const botToken = config.botToken as string | undefined;
  const chatId = config.chatId as string | undefined;
  if (!botToken || !chatId) throw new Error('telegram action: botToken and chatId are required');

  let text = (config.text as string) ?? '';
  if (!text && input && typeof input === 'object' && 'text' in (input as object)) {
    text = String((input as Record<string, unknown>).text);
  }
  if (!text) throw new Error('telegram action: text is required (in config or input)');

  const parseModeRaw = config.parseMode as string | undefined;
  const parseMode =
    parseModeRaw === 'Markdown' || parseModeRaw === 'MarkdownV2' || parseModeRaw === 'HTML'
      ? parseModeRaw
      : undefined;

  const disablePreviewRaw = config.disableWebPreview as unknown;
  const disable_web_page_preview =
    disablePreviewRaw === true ||
    disablePreviewRaw === 'true' ||
    disablePreviewRaw === 1 ||
    disablePreviewRaw === '1';

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(disable_web_page_preview ? { disable_web_page_preview: true } : {}),
    }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Telegram API error: ${(data.description as string) ?? res.statusText}`);
  }
  return { ok: data.ok === true, result: data.result };
};
