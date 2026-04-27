import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@app/redis';

const PENDING_PREFIX = 'signal-verification-pending';
const CODE_PREFIX = 'signal-verification-code';
const TTL_SECONDS = 10 * 60;

const SIX_DIGIT_PATTERN = /\b(\d{3})-?(\d{3})\b/;

/**
 * Redis-backed bridge that lets the Signal onboarding flow consume the
 * verification SMS arriving at a managed Twilio number, even though the
 * SMS lands in notify-service/incoming and the wait happens in
 * notify-service/onboarding.
 *
 * Lifecycle:
 *   1. Signal onboarding enters the verifyCode step → markPending(tenantId).
 *   2. SMS webhook arrives on the tenant's number → if isPending matches,
 *      extractCode() pulls a 6-digit group out of the body and recordCode()
 *      stashes it.
 *   3. Frontend (BFF resolver) polls / subscribes to read the code; the
 *      Signal provider verifies it and wins.
 *   4. clearPending() runs on success, cancel, or terminal error.
 *
 * Both keys carry a 10-minute TTL — Twilio retries inbound webhooks for
 * up to ~15 min, but a verification code that arrives later is no longer
 * useful (Signal expires the code) so the cache window is intentionally
 * shorter than full WebHook retry.
 */
@Injectable()
export class SignalVerificationBridgeService {
  private readonly logger = new Logger(SignalVerificationBridgeService.name);

  constructor(private readonly cache: CacheService) {}

  async markPending(tenantId: string): Promise<void> {
    await this.cache.saveInCache({
      identifier: tenantId,
      prefix: PENDING_PREFIX,
      data: { since: new Date().toISOString() },
      EX: TTL_SECONDS,
    });
  }

  async clearPending(tenantId: string): Promise<void> {
    await this.cache.removeFromCache({ identifier: tenantId, prefix: PENDING_PREFIX });
    await this.cache.removeFromCache({ identifier: tenantId, prefix: CODE_PREFIX });
  }

  async isPending(tenantId: string): Promise<boolean> {
    return this.cache.checkExistsInCache({ identifier: tenantId, prefix: PENDING_PREFIX });
  }

  async recordCode(tenantId: string, code: string): Promise<void> {
    await this.cache.saveInCache({
      identifier: tenantId,
      prefix: CODE_PREFIX,
      data: { code, receivedAt: new Date().toISOString() },
      EX: TTL_SECONDS,
    });
    this.logger.log(`Recorded Signal verification code for tenant ${tenantId}.`);
  }

  /**
   * Pulls a 6-digit code out of an SMS body. Signal's wording is
   * "Your Signal verification code: 123-456" — we accept both with and
   * without the dash, and we tolerate any surrounding text.
   */
  extractCode(body: string): string | null {
    const match = body.match(SIX_DIGIT_PATTERN);
    return match ? `${match[1]}${match[2]}` : null;
  }
}
