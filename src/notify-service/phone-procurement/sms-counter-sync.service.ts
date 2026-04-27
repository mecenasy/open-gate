import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PhoneProcurementService } from './phone-procurement.service';

/**
 * Row shape the cron iterates over. The fetch goes through a db-service
 * gRPC method that lands with the phone-procurement contract; until then
 * `listManagedNumbers()` returns empty so the cron is a no-op.
 */
interface ManagedPhoneRow {
  tenantId: string;
  phoneE164: string;
  providerKey: string;
}

/**
 * Reconciles each managed phone number's monthly_message_count against
 * the operator's actual send history. Runs once at 00:00 UTC every day:
 *
 *   1. List every managed phone (provisioned_by = 'managed').
 *   2. For each, ask the originating provider how many messages it sent
 *      between yesterday 00:00 UTC and today 00:00 UTC.
 *   3. Upsert sms_sync_log with UNIQUE(tenant_id, sync_date) so reruns
 *      (manual, restart, deploy) don't double-count.
 *   4. Add yesterday's count to monthly_message_count.
 *   5. If today is the 1st of the month, reset the counter to 0 *after*
 *      step 4 so the previous month's tail still gets recorded under the
 *      closing month before we start the new one.
 *
 * The cron skips numbers whose provider returns null from
 * countMessagesForRange (notably the mock sandbox provider).
 *
 * The DB-touching helpers below are stubs until the phone-procurement
 * gRPC contract lands. The cron itself ships now so wiring in the gRPC
 * methods becomes a small follow-up rather than a feature change.
 */
@Injectable()
export class SmsCounterSyncService {
  private readonly logger = new Logger(SmsCounterSyncService.name);

  constructor(private readonly procurement: PhoneProcurementService) {}

  @Cron('0 0 * * *', { name: 'sms-counter-sync', timeZone: 'UTC' })
  async syncDaily(): Promise<void> {
    const todayStartUtc = startOfTodayUtc();
    const yesterdayStartUtc = new Date(todayStartUtc);
    yesterdayStartUtc.setUTCDate(yesterdayStartUtc.getUTCDate() - 1);
    const syncDate = toIsoDate(yesterdayStartUtc);

    const rows = await this.listManagedNumbers();
    if (rows.length === 0) {
      this.logger.debug('No managed phone numbers to sync.');
      return;
    }

    let synced = 0;
    let skipped = 0;
    for (const row of rows) {
      try {
        if (await this.alreadySynced(row.tenantId, syncDate)) {
          skipped++;
          continue;
        }
        const count = await this.procurement.countMessagesForRange(row.providerKey, {
          phoneE164: row.phoneE164,
          fromUtc: yesterdayStartUtc,
          toUtc: todayStartUtc,
        });
        if (count === null) {
          // Provider doesn't expose usage data (mock) — skip without
          // leaving a sync_log row, so a real provider for the same row
          // could backfill later.
          skipped++;
          continue;
        }
        await this.recordSyncLog(row.tenantId, syncDate, count);
        await this.incrementMonthlyCounter(row.tenantId, count);
        synced++;
      } catch (err) {
        this.logger.error(`Sync failed for tenant=${row.tenantId} phone=${row.phoneE164}: ${stringifyError(err)}`);
      }
    }

    if (todayStartUtc.getUTCDate() === 1) {
      // Run reset *after* yesterday's increments — the last day of the
      // previous month still gets attributed to the closing month before
      // we wipe the counter for the new one.
      await this.resetAllMonthlyCounters();
    }

    this.logger.log(`SMS counter sync done for ${syncDate}: synced=${synced} skipped=${skipped} total=${rows.length}`);
  }

  // ----- DB-side stubs (wired to gRPC in the procurement-contract commit) ---

  private async listManagedNumbers(): Promise<ManagedPhoneRow[]> {
    return [];
  }

  private async alreadySynced(_tenantId: string, _syncDate: string): Promise<boolean> {
    return false;
  }

  private async recordSyncLog(tenantId: string, syncDate: string, count: number): Promise<void> {
    this.logger.debug(`[stub] sms_sync_log insert: tenant=${tenantId} date=${syncDate} count=${count}`);
  }

  private async incrementMonthlyCounter(tenantId: string, count: number): Promise<void> {
    this.logger.debug(`[stub] tenant_phone_numbers monthly counter += ${count} for tenant=${tenantId}`);
  }

  private async resetAllMonthlyCounters(): Promise<void> {
    this.logger.debug(`[stub] reset monthly_message_count to 0 for all managed rows`);
  }
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function stringifyError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
