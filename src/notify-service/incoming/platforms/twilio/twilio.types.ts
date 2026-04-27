/**
 * Twilio webhook payload shape — form-urlencoded body fields, all strings.
 *
 * Twilio sends many more fields (geo-data, sender carrier, ...); this is
 * the subset we actually consume. Unknown fields are preserved in `raw`
 * so transformers can fall back if needed.
 */
export interface TwilioSmsWebhookPayload {
  /** Twilio-issued message SID. */
  MessageSid: string;
  /** Recipient (our purchased number) — used to route to the owning tenant. */
  To: string;
  /** Sender's E.164 number. */
  From: string;
  /** Message body. May be empty for MMS-only attachments. */
  Body?: string;
  /** Account SID this message was billed to. */
  AccountSid?: string;
  /** Number of media attachments — drives MediaUrl{0..N-1} / MediaContentType{0..N-1} pairs. */
  NumMedia?: string;
  /** Number of message segments. Informational. */
  NumSegments?: string;
  /** Country of the From number (ISO 3166-1 alpha-2). */
  FromCountry?: string;
  /** ISO 3166-1 alpha-2 country of the To number. */
  ToCountry?: string;
}

/**
 * Twilio webhook payload extended with positional Media fields. Consumers
 * reading attachments unpack `MediaUrl0`, `MediaContentType0`, ...
 */
export type TwilioSmsWebhookPayloadWithMedia = TwilioSmsWebhookPayload & Record<string, string>;
