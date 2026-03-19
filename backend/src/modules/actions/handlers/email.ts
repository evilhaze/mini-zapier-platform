import nodemailer from 'nodemailer';
import type { ActionHandler } from '../types.js';

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function parsePort(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mapSmtpErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const withCode = err as { code?: unknown };
  const code = typeof withCode?.code === 'string' ? withCode.code : '';

  if (code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED')) {
    return 'SMTP connection failed: server refused connection. Check SMTP_HOST/SMTP_PORT and provider firewall rules.';
  }
  if (code === 'ENOTFOUND' || msg.includes('ENOTFOUND')) {
    return 'SMTP connection failed: host not found. Verify SMTP_HOST.';
  }
  if (code === 'EAUTH' || msg.toLowerCase().includes('auth')) {
    return 'SMTP authentication failed. Verify SMTP_USER/SMTP_PASS.';
  }
  if (msg.toLowerCase().includes('timed out')) {
    return 'SMTP connection timed out. Check SMTP_HOST/SMTP_PORT and network access.';
  }

  return `Email sending failed: ${msg}`;
}

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

  const envUrl = process.env.SMTP_URL?.trim();
  const envHost = process.env.SMTP_HOST?.trim();
  const envPort = parsePort(process.env.SMTP_PORT);
  const envSecure = parseBoolean(process.env.SMTP_SECURE);
  const envUser = process.env.SMTP_USER?.trim();
  const envPass = process.env.SMTP_PASS?.trim();
  const envFrom = process.env.SMTP_FROM?.trim() ?? process.env.EMAIL_FROM?.trim();

  const cfgHost = typeof config.host === 'string' ? config.host.trim() : undefined;
  const cfgPort = config.port != null ? Number(config.port) : undefined;
  const cfgSecure =
    config.secure === true ? true : config.secure === false ? false : undefined;
  const cfgSmtpUrl = typeof config.smtpUrl === 'string' ? config.smtpUrl.trim() : undefined;
  const cfgAuth =
    config.auth && typeof config.auth === 'object'
      ? {
          user: (config.auth as { user?: string }).user,
          pass: (config.auth as { pass?: string }).pass,
        }
      : undefined;

  const hasStructuredTransport = Boolean(cfgHost ?? envHost ?? cfgPort ?? envPort);

  if (!cfgSmtpUrl && !envUrl && !hasStructuredTransport) {
    throw new Error(
      'SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT (and optionally SMTP_USER/SMTP_PASS, SMTP_FROM).'
    );
  }

  if (!cfgSmtpUrl && !envUrl) {
    const missing: string[] = [];
    if (!(cfgHost ?? envHost)) missing.push('SMTP_HOST');
    if (!Number.isFinite(cfgPort ?? envPort)) missing.push('SMTP_PORT');
    if (missing.length > 0) {
      throw new Error(
        `SMTP is not configured: missing ${missing.join(', ')}. Set SMTP_URL or required SMTP env vars.`
      );
    }
  }

  const transportOptions =
    cfgSmtpUrl && cfgSmtpUrl.length > 0
      ? cfgSmtpUrl
      : envUrl && envUrl.length > 0
        ? envUrl
        : {
            host: cfgHost ?? envHost,
            port: cfgPort ?? envPort,
            secure: cfgSecure ?? envSecure ?? false,
            auth: cfgAuth ?? (envUser && envPass ? { user: envUser, pass: envPass } : undefined),
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
    const humanMessage = mapSmtpErrorMessage(err);
    console.error(`${logPrefix} send failed: ${humanMessage}`);
    throw new Error(humanMessage);
  }
};
