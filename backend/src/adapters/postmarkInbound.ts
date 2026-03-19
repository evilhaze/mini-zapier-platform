/**
 * Maps Postmark inbound webhook payload to our internal email trigger format.
 * @see https://postmarkapp.com/developer/webhooks/inbound-webhook
 */

export type PostmarkInboundPayload = {
  From?: string;
  FromName?: string;
  FromFull?: { Email?: string; Name?: string };
  To?: string;
  ToFull?: Array<{ Email?: string; Name?: string }>;
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  MessageStream?: string;
  [key: string]: unknown;
};

export type InternalEmailPayload = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

/**
 * Convert Postmark inbound JSON to { from, to, subject, text, html }.
 * Uses From, To (or first ToFull.Email), Subject, TextBody, HtmlBody.
 */
export function mapPostmarkInboundToInternal(body: PostmarkInboundPayload): InternalEmailPayload {
  const from =
    typeof body.From === 'string'
      ? body.From.trim()
      : body.FromFull?.Email != null
        ? String(body.FromFull.Email).trim()
        : undefined;

  let to: string | undefined;
  if (Array.isArray(body.ToFull) && body.ToFull.length > 0 && body.ToFull[0]?.Email) {
    to = String(body.ToFull[0].Email).trim();
  } else if (typeof body.To === 'string') {
    to = body.To.trim();
  }

  const subject =
    typeof body.Subject === 'string' ? body.Subject.trim() : undefined;
  const text =
    typeof body.TextBody === 'string' ? body.TextBody : undefined;
  const html =
    typeof body.HtmlBody === 'string' ? body.HtmlBody : undefined;

  return { from, to, subject, text, html };
}
