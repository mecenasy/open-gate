import { Injectable, Logger } from '@nestjs/common';

/**
 * Routes inbound Twilio webhooks to the tenant that owns the receiving
 * number. The actual db-side query lands with the phone-procurement gRPC
 * contract in a follow-up commit; until then this stub returns null so
 * webhooks for unknown numbers (which is all of them, pre-wiring) are
 * accepted by the controller (returns 200 to Twilio so it doesn't retry)
 * but produce no MessageEvent.
 *
 * Once wired, lookup is by exact `phone_e164` match against
 * shared_config.tenant_phone_numbers.
 */
@Injectable()
export class TwilioTenantLookupService {
  private readonly logger = new Logger(TwilioTenantLookupService.name);

  async lookupTenantByPhoneNumber(phoneE164: string): Promise<string | null> {
    this.logger.debug(`Tenant lookup for ${phoneE164} — not yet wired (gRPC service lands next phase).`);
    return null;
  }
}
