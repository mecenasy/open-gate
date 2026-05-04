import { Injectable, Logger } from '@nestjs/common';
import { PhoneProvisionedBy } from '@app/entities';
import { PlatformConfigService } from '../platform-config/platform-config.service';
import { SignalRestClient } from '../onboarding/platforms/signal/signal-rest.client';
import { PhoneProcurementService } from './phone-procurement.service';
import { PhoneProcurementDbClient } from './db/phone-procurement-db.client';

export interface PlatformCleanupResult {
  platform: string;
  status: boolean;
  message: string;
}

/**
 * Orchestrates external-account teardown for a tenant about to be deleted.
 *
 * Each handler is best-effort and isolated: a Twilio outage doesn't stop
 * the Signal unregister and vice versa. The aggregate `status` is true
 * only if every handler reported success — the caller (BFF) currently
 * proceeds with the DB delete either way and logs failures, so a partial
 * cleanup still surfaces in the per-platform array for ops.
 *
 * Adding a new platform: write a new private handler that returns
 * PlatformCleanupResult and append it to `unregisterAll`'s call list.
 */
@Injectable()
export class TenantPlatformCleanupService {
  private readonly logger = new Logger(TenantPlatformCleanupService.name);

  constructor(
    private readonly procurement: PhoneProcurementService,
    private readonly procurementDb: PhoneProcurementDbClient,
    private readonly platformConfig: PlatformConfigService,
    private readonly signalRest: SignalRestClient,
  ) {}

  async unregisterAll(tenantId: string): Promise<PlatformCleanupResult[]> {
    return Promise.all([this.unregisterTwilio(tenantId), this.unregisterSignal(tenantId)]);
  }

  private async unregisterTwilio(tenantId: string): Promise<PlatformCleanupResult> {
    try {
      const phone = await this.procurementDb.getTenantPhoneNumber(tenantId);
      if (!phone) {
        return { platform: 'twilio', status: true, message: 'no number attached' };
      }
      if (phone.provisionedBy !== PhoneProvisionedBy.Managed) {
        // Self-provisioned: tenant brings their own credentials, we never
        // owned the SID — must NOT call .remove() on Twilio.
        return { platform: 'twilio', status: true, message: 'self-provisioned, skipped' };
      }
      try {
        await this.procurement.releaseFromProvider(phone.providerKey, phone.providerExternalId);
        return { platform: 'twilio', status: true, message: 'released' };
      } catch (err) {
        if (isNotFoundError(err)) {
          this.logger.warn(
            `Provider ${phone.providerKey} returned 404 for ${phone.providerExternalId}; treating as released.`,
          );
          return { platform: 'twilio', status: true, message: 'already released (404)' };
        }
        throw err;
      }
    } catch (err) {
      const message = stringifyError(err);
      this.logger.error(`Twilio unregister failed for tenant=${tenantId}: ${message}`);
      return { platform: 'twilio', status: false, message };
    }
  }

  private async unregisterSignal(tenantId: string): Promise<PlatformCleanupResult> {
    try {
      const creds = await this.platformConfig.getConfig(tenantId, 'signal');
      if (!creds?.account || !creds.apiUrl) {
        return { platform: 'signal', status: true, message: 'no account configured' };
      }
      const result = await this.signalRest.unregister(creds.apiUrl, creds.account);
      if (result.ok) {
        return { platform: 'signal', status: true, message: 'unregistered' };
      }
      // signal-cli returns 404 on already-unregistered numbers — describeError
      // includes the status text, but we don't have a structured code here, so
      // log the message and keep the operation idempotent for the caller.
      this.logger.warn(`Signal unregister non-OK for tenant=${tenantId}: ${result.message ?? 'unknown'}`);
      return { platform: 'signal', status: false, message: result.message ?? 'unregister failed' };
    } catch (err) {
      const message = stringifyError(err);
      this.logger.error(`Signal unregister failed for tenant=${tenantId}: ${message}`);
      return { platform: 'signal', status: false, message };
    }
  }
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  return status === 404;
}
