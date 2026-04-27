import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PhoneProcurementService } from './phone-procurement.service';

/** Wizard abandonment safety window — anything older has clearly been forgotten. */
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

interface UnattachedPurchaseRow {
  id: string;
  providerKey: string;
  providerExternalId: string;
  phoneE164: string;
  purchasedAt: Date;
}

/**
 * Hourly cron — releases phone numbers the master account bought during
 * a wizard run that the user never finished. Without this, abandoned
 * wizards keep paying the operator's monthly rent for numbers nobody
 * uses.
 *
 * Two-step per row to keep the operator and our DB in agreement:
 *   1. Tell the provider to release the number (Twilio: DELETE
 *      IncomingPhoneNumber). On 4xx assume the number is already gone
 *      and proceed; on 5xx leave the row for next run.
 *   2. Delete the pending_phone_purchases row.
 *
 * The 1h cadence is plenty — wizards complete in minutes, so we'd never
 * release a number a user is actively about to attach.
 *
 * The DB-touching helpers below are stubs until the phone-procurement
 * gRPC contract lands; the cron is in place so wiring becomes a small
 * follow-up.
 */
@Injectable()
export class PendingPurchaseCleanupService {
  private readonly logger = new Logger(PendingPurchaseCleanupService.name);

  constructor(private readonly procurement: PhoneProcurementService) {}

  @Cron('0 * * * *', { name: 'pending-purchase-cleanup', timeZone: 'UTC' })
  async cleanupStale(): Promise<void> {
    const cutoff = new Date(Date.now() - STALE_AFTER_MS);
    const stale = await this.listStaleUnattached(cutoff);
    if (stale.length === 0) {
      this.logger.debug('No stale pending purchases to release.');
      return;
    }

    let released = 0;
    let failed = 0;
    for (const row of stale) {
      try {
        await this.procurement.releaseFromProvider(row.providerKey, row.providerExternalId);
        await this.deletePendingRow(row.id);
        released++;
        this.logger.log(`Released stale purchase ${row.providerKey}/${row.providerExternalId} (${row.phoneE164}).`);
      } catch (err) {
        failed++;
        this.logger.warn(
          `Failed to release ${row.providerKey}/${row.providerExternalId}; will retry next run: ${stringifyError(err)}`,
        );
      }
    }
    this.logger.log(`Pending purchase cleanup done: released=${released} failed=${failed}.`);
  }

  // ----- DB-side stubs (wired to gRPC in the procurement-contract commit) ---

  private async listStaleUnattached(_cutoff: Date): Promise<UnattachedPurchaseRow[]> {
    return [];
  }

  private async deletePendingRow(id: string): Promise<void> {
    this.logger.debug(`[stub] DELETE pending_phone_purchases id=${id}`);
  }
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
