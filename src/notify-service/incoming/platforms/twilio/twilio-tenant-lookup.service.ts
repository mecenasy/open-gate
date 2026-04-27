import { Injectable, Logger } from '@nestjs/common';
import { PhoneProcurementDbClient } from '../../../phone-procurement/db/phone-procurement-db.client';

/**
 * Routes inbound Twilio webhooks to the tenant that owns the receiving
 * number — exact `phone_e164` match against shared_config.tenant_phone_numbers
 * via the db-service gRPC contract.
 *
 * Returns null when the number isn't recognised; the bridge logs that and
 * drops the webhook with a 200 to keep Twilio from retrying.
 */
@Injectable()
export class TwilioTenantLookupService {
  private readonly logger = new Logger(TwilioTenantLookupService.name);

  constructor(private readonly dbClient: PhoneProcurementDbClient) {}

  async lookupTenantByPhoneNumber(phoneE164: string): Promise<string | null> {
    try {
      const entry = await this.dbClient.getTenantPhoneNumberByE164(phoneE164);
      return entry?.tenantId ?? null;
    } catch (err) {
      this.logger.warn(`Tenant lookup failed for ${phoneE164}: ${stringifyError(err)}`);
      return null;
    }
  }
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
