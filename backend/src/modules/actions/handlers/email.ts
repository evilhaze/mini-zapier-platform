import nodemailer from 'nodemailer';
import type { ActionHandler } from '../types.js';

/**
 * Email action: to, subject, text/html.
 * Uses nodemailer. Config can include transport options (host, port, secure, auth).
 */
export const emailHandler: ActionHandler = async (config, _input, context) => {
  const to = config.to as string | string[] | undefined;
  if (!to) throw new Error('email action: to is required');

  const subject = (config.subject as string) ?? '';
  // Frontend currently stores the body in `body` for the Email node.
  // Support both `text` and `body` to keep MVP smooth.
  let text =
    (config.text as string | undefined) ??
    (config.body as string | undefined) ??
    undefined;
  const html = config.html as string | undefined;

  // Allow using upstream webhook payload for quick local testing.
  if (!text && !html && _input && typeof _input === 'object' && 'message' in (_input as object)) {
    text = String((_input as Record<string, unknown>).message);
  }

  if (!text && !html) throw new Error('email action: text/html (or body) is required');

  const envUrl = process.env.SMTP_URL;
  const envHost = process.env.SMTP_HOST;
  const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const envSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined;
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASS;
  const envFrom = process.env.EMAIL_FROM;

  const transportOptions =
    typeof config.smtpUrl === 'string'
      ? (config.smtpUrl as string)
      : typeof envUrl === 'string' && envUrl.length > 0
        ? envUrl
        : {
            host: (config.host as string | undefined) ?? envHost ?? 'localhost',
            port: (config.port != null ? Number(config.port) : undefined) ?? envPort ?? 587,
            secure:
              (config.secure === true ? true : config.secure === false ? false : undefined) ??
              envSecure ??
              false,
            auth:
              config.auth && typeof config.auth === 'object'
                ? {
                    user: (config.auth as { user?: string }).user,
                    pass: (config.auth as { pass?: string }).pass,
                  }
                : envUser && envPass
                  ? { user: envUser, pass: envPass }
                  : undefined,
          };

  const transporter = nodemailer.createTransport(transportOptions as Parameters<typeof nodemailer.createTransport>[0]);

  const logPrefix = `[email action${context ? ` wf=${context.workflowId} ex=${context.executionId}` : ''}]`;
  console.log(`${logPrefix} started -> to=${Array.isArray(to) ? to.join(',') : to}`);
  try {
    const info = await transporter.sendMail({
      from: (config.from as string | undefined) ?? envFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text ?? undefined,
      html: html ?? undefined,
    });
    console.log(`${logPrefix} sent successfully -> messageId=${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${logPrefix} send failed: ${msg}`);
    throw err;
  }
};
