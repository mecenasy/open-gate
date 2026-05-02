import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@app/redis';

const PENDING_PREFIX = 'signal-verification-pending';
const CODE_PREFIX = 'signal-verification-code';
const TTL_SECONDS = 10 * 60;

const SIX_DIGIT_PATTERN = /\b(\d{3})-?(\d{3})\b/;
// Placeholder — refine when we have real Messenger/Facebook SMS samples.
const MESSENGER_PATTERN = /\bFB-(\d{4,8})\b/i;
const SIGNAL_KEYWORD = /signal/i;
const WHATSAPP_KEYWORD = /whats?app/i;
const MESSENGER_KEYWORD = /(messenger|facebook|\bfb[-\s])/i;

export type VerificationSource = 'signal' | 'whatsapp' | 'messenger';

export interface RecordedVerificationCode {
  code: string;
  source: VerificationSource;
  receivedAt: string;
}

export interface ExtractedVerificationCode {
  code: string;
  source: VerificationSource;
}

interface Pattern {
  source: VerificationSource;
  match: (body: string) => string | null;
}

const PATTERNS: Pattern[] = [
  {
    source: 'signal',
    match: (body) => {
      if (!SIGNAL_KEYWORD.test(body)) return null;
      const m = body.match(SIX_DIGIT_PATTERN);
      return m ? `${m[1]}${m[2]}` : null;
    },
  },
  {
    source: 'whatsapp',
    match: (body) => {
      if (!WHATSAPP_KEYWORD.test(body)) return null;
      const m = body.match(SIX_DIGIT_PATTERN);
      return m ? `${m[1]}${m[2]}` : null;
    },
  },
  {
    source: 'messenger',
    match: (body) => {
      if (!MESSENGER_KEYWORD.test(body)) return null;
      const m = body.match(MESSENGER_PATTERN) ?? body.match(SIX_DIGIT_PATTERN);
      if (!m) return null;
      return m.length > 2 ? `${m[1]}${m[2]}` : m[1];
    },
  },
];

/**
 * Redis-backed bridge that lets the Signal onboarding flow consume the
 * verification SMS arriving at a managed Twilio number, even though the
 * SMS lands in notify-service/incoming and the wait happens in
 * notify-service/onboarding.
 *
 * Keyed by Signal account E.164 — that's the account being registered
 * and the same value the Twilio webhook receives in `To`. Tenant ID
 * isn't useful as a key because the wizard flow runs the registration
 * before the tenant exists.
 *
 * Lifecycle:
 *   1. Signal onboarding enters the verifyCode step → markPending(account).
 *   2. SMS webhook arrives on the same number → extractCode() pulls a
 *      6-digit group out of the body and recordCode() stashes it.
 *   3. Frontend (BFF resolver) polls to read the code and auto-fills
 *      the verify input; the Signal provider verifies it and wins.
 *   4. clearPending() runs on success, cancel, or terminal error.
 *
 * Both keys carry a 10-minute TTL — Twilio retries inbound webhooks for
 * up to ~15 min, but a verification code that arrives later is no longer
 * useful (Signal expires the code) so the cache window is intentionally
 * shorter than full webhook retry.
 */
@Injectable()
export class SignalVerificationBridgeService {
  private readonly logger = new Logger(SignalVerificationBridgeService.name);

  constructor(private readonly cache: CacheService) {}

  async markPending(phoneE164: string): Promise<void> {
    await this.cache.saveInCache({
      identifier: phoneE164,
      prefix: PENDING_PREFIX,
      data: { since: new Date().toISOString() },
      EX: TTL_SECONDS,
    });
  }

  async clearPending(phoneE164: string): Promise<void> {
    await this.cache.removeFromCache({ identifier: phoneE164, prefix: PENDING_PREFIX });
    await this.cache.removeFromCache({ identifier: phoneE164, prefix: CODE_PREFIX });
  }

  async isPending(phoneE164: string): Promise<boolean> {
    return this.cache.checkExistsInCache({ identifier: phoneE164, prefix: PENDING_PREFIX });
  }

  async recordCode(phoneE164: string, code: string, source: VerificationSource): Promise<void> {
    await this.cache.saveInCache({
      identifier: phoneE164,
      prefix: CODE_PREFIX,
      data: { code, source, receivedAt: new Date().toISOString() },
      EX: TTL_SECONDS,
    });
    this.logger.log(`Recorded ${source} verification code for ${phoneE164}.`);
  }

  async getCode(phoneE164: string): Promise<RecordedVerificationCode | null> {
    return this.cache.getFromCache<RecordedVerificationCode>({
      identifier: phoneE164,
      prefix: CODE_PREFIX,
    });
  }

  /**
   * Pulls a verification code out of an SMS body and identifies which
   * platform sent it. Source detection runs on a keyword match in the
   * body (e.g. "Signal", "WhatsApp", "Messenger"); the digit pattern is
   * shared (6 digits with optional dash) for Signal/WhatsApp, and a
   * placeholder pattern for Messenger until we have real samples.
   */
  extractCode(body: string): ExtractedVerificationCode | null {
    for (const pattern of PATTERNS) {
      const code = pattern.match(body);
      if (code) return { code, source: pattern.source };
    }
    return null;
  }
}
