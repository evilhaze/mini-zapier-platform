import nodemailer from 'nodemailer';
import type { ActionHandler } from '../types.js';

/**
 * Email action: to, subject, text/html.
 * Uses nodemailer. Config can include transport options (host, port, secure, auth).
 */
export const emailHandler: ActionHandler = async (config, _input) => {
  const to = config.to as string | string[] | undefined;
  if (!to) throw new Error('email action: to is required');

  const subject = (config.subject as string) ?? '';
  const text = config.text as string | undefined;
  const html = config.html as string | undefined;
  if (!text && !html) throw new Error('email action: text or html is required');

  const transportOptions = {
    host: (config.host as string) ?? 'localhost',
    port: Number(config.port) ?? 587,
    secure: config.secure === true,
    auth:
      config.auth && typeof config.auth === 'object'
        ? {
            user: (config.auth as { user?: string }).user,
            pass: (config.auth as { pass?: string }).pass,
          }
        : undefined,
  };

  const transporter = nodemailer.createTransport(transportOptions as Parameters<typeof nodemailer.createTransport>[0]);
  const info = await transporter.sendMail({
    from: config.from as string | undefined,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text: text ?? undefined,
    html: html ?? undefined,
  });
  return { sent: true, messageId: info.messageId };
};
