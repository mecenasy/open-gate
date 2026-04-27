import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PhoneProcurementService } from './phone-procurement.service';
import { PhoneProcurementDbClient } from './db/phone-procurement-db.client';

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
 * Skips numbers whose provider returns null from countMessagesForRange
 * (notably the mock sandbox provider) — no sync_log row is written so a
 * real provider for the same row could backfill later.
 */
@Injectable()
export class SmsCounterSyncService {
  private readonly logger = new Logger(SmsCounterSyncService.name);

  constructor(
    private readonly procurement: PhoneProcurementService,
    private readonly dbClient: PhoneProcurementDbClient,
  ) {}

  @Cron('0 0 * * *', { name: 'sms-counter-sync', timeZone: 'UTC' })
  async syncDaily(): Promise<void> {
    const todayStartUtc = startOfTodayUtc();
    const yesterdayStartUtc = new Date(todayStartUtc);
    yesterdayStartUtc.setUTCDate(yesterdayStartUtc.getUTCDate() - 1);
    const syncDate = toIsoDate(yesterdayStartUtc);

    const rows = await this.dbClient.listManagedPhoneNumbers();
    if (rows.length === 0) {
      this.logger.debug('No managed phone numbers to sync.');
      return;
    }

    let synced = 0;
    let skipped = 0;
    for (const row of rows) {
      try {
        if (await this.dbClient.hasSmsSyncLogForDate(row.tenantId, syncDate)) {
          skipped++;
          continue;
        }
        const count = await this.procurement.countMessagesForRange(row.providerKey, {
          phoneE164: row.phoneE164,
          fromUtc: yesterdayStartUtc,
          toUtc: todayStartUtc,
        });
        if (count === null) {
          skipped++;
          continue;
        }
        await this.dbClient.insertSmsSyncLog(row.tenantId, syncDate, count);
        await this.dbClient.incrementMonthlyMessageCount(row.tenantId, count, todayStartUtc);
        synced++;
      } catch (err) {
        this.logger.error(`Sync failed for tenant=${row.tenantId} phone=${row.phoneE164}: ${stringifyError(err)}`);
      }
    }

    if (todayStartUtc.getUTCDate() === 1) {
      // Run reset *after* yesterday's increments — the last day of the
      // previous month still gets attributed to the closing month before
      // we wipe the counter for the new one.
      await this.dbClient.resetAllMonthlyMessageCounts();
    }

    this.logger.log(`SMS counter sync done for ${syncDate}: synced=${synced} skipped=${skipped} total=${rows.length}`);
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
