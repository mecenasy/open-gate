/**
 * Provider-agnostic phone procurement contract. Twilio, mock, and any
 * future SMS operator implement the same shapes; nothing in `notify-service`
 * outside `providers/twilio/` should reference Twilio types.
 */

export interface PhoneCapabilities {
  sms: boolean;
  mms: boolean;
  voice: boolean;
}

/**
 * Loose shape upstream operators report capabilities in — fields can be
 * absent or null when the provider hasn't classified them. Normalize to
 * `PhoneCapabilities` (strict booleans) before exposing outward.
 */
export interface RawProviderCapabilities {
  sms?: boolean | null;
  mms?: boolean | null;
  voice?: boolean | null;
}

export function normalizeCapabilities(raw: RawProviderCapabilities): PhoneCapabilities {
  return {
    sms: !!raw.sms,
    mms: !!raw.mms,
    voice: !!raw.voice,
  };
}

export interface ListAvailableOptions {
  /** ISO 3166-1 alpha-2 country code: 'PL', 'DE', 'US', ... */
  country: string;
  /** Number type. Defaults to 'mobile' (best Signal compatibility). */
  type?: 'mobile' | 'local' | 'tollfree';
  /** Max numbers to return. Provider may cap lower. */
  limit?: number;
}

export interface AvailableNumber {
  phoneE164: string;
  capabilities: PhoneCapabilities;
  /** Region/state, when reported by the provider. */
  region?: string;
  /** City, when reported by the provider. */
  locality?: string;
}

export interface PurchaseOptions {
  phoneE164: string;
  /** Used by the provider to attach the right regulatory bundle. */
  country: string;
  /** Provider configures these on the purchased number when supplied. */
  webhookSmsUrl?: string;
  webhookVoiceUrl?: string;
}

export interface PurchaseResult {
  /** Provider's own ID for the purchased resource (Twilio SID, mock UUID, ...). */
  externalId: string;
  phoneE164: string;
  capabilities: PhoneCapabilities;
}

export interface ReleaseResult {
  externalId: string;
  released: true;
}

export interface CountMessagesOptions {
  phoneE164: string;
  /** Inclusive start, UTC. */
  fromUtc: Date;
  /** Exclusive end, UTC. */
  toUtc: Date;
}
