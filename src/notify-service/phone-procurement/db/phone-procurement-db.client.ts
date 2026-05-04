import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { DbGrpcKey } from '@app/db-grpc';
import {
  PHONE_PROCUREMENT_DB_SERVICE_NAME,
  type PendingPurchaseEntry,
  type PhoneProcurementDbServiceClient,
  type TenantPhoneNumberEntry,
} from 'src/proto/phone-procurement';

/**
 * Thin RxJS-to-Promise wrapper over the db-service phone-procurement
 * gRPC contract. Keeps notify-service callers (webhook tenant lookup,
 * sync cron, cleanup cron) free of grpc-client plumbing.
 *
 * Empty `entry` fields on the wire are folded back to null on the way out
 * so callers can `if (!entry)` instead of `if (!entry?.id)`.
 */
@Injectable()
export class PhoneProcurementDbClient implements OnModuleInit {
  private readonly logger = new Logger(PhoneProcurementDbClient.name);
  private client!: PhoneProcurementDbServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpc: ClientGrpc) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<PhoneProcurementDbServiceClient>(PHONE_PROCUREMENT_DB_SERVICE_NAME);
  }

  async getTenantPhoneNumberByE164(phoneE164: string): Promise<TenantPhoneNumberEntry | null> {
    const res = await firstValueFrom(this.client.getTenantPhoneNumberByE164({ phoneE164 }));
    return res.status && res.entry ? res.entry : null;
  }

  async getTenantPhoneNumber(tenantId: string): Promise<TenantPhoneNumberEntry | null> {
    const res = await firstValueFrom(this.client.getTenantPhoneNumber({ tenantId }));
    return res.status && res.entry ? res.entry : null;
  }

  async listManagedPhoneNumbers(): Promise<TenantPhoneNumberEntry[]> {
    const res = await firstValueFrom(this.client.listManagedPhoneNumbers({}));
    return res.status ? (res.entries ?? []) : [];
  }

  async hasSmsSyncLogForDate(tenantId: string, syncDate: string): Promise<boolean> {
    const res = await firstValueFrom(this.client.hasSmsSyncLogForDate({ tenantId, syncDate }));
    return res.status && res.exists;
  }

  async insertSmsSyncLog(tenantId: string, syncDate: string, messagesCounted: number): Promise<void> {
    await firstValueFrom(this.client.insertSmsSyncLog({ tenantId, syncDate, messagesCounted }));
  }

  async incrementMonthlyMessageCount(tenantId: string, delta: number, syncedAt: Date): Promise<void> {
    await firstValueFrom(
      this.client.incrementMonthlyMessageCount({ tenantId, delta, syncedAt: syncedAt.toISOString() }),
    );
  }

  async resetAllMonthlyMessageCounts(): Promise<void> {
    await firstValueFrom(this.client.resetAllMonthlyMessageCounts({}));
  }

  async listUnattachedPendingPurchases(cutoff: Date): Promise<PendingPurchaseEntry[]> {
    const res = await firstValueFrom(this.client.listUnattachedPendingPurchases({ cutoffIso: cutoff.toISOString() }));
    return res.status ? (res.entries ?? []) : [];
  }

  async deletePendingPurchase(pendingId: string): Promise<void> {
    await firstValueFrom(this.client.deletePendingPurchase({ pendingId }));
  }

  async insertPendingPurchase(input: {
    ownerUserId: string;
    providerKey: string;
    providerExternalId: string;
    phoneE164: string;
  }): Promise<PendingPurchaseEntry | null> {
    const res = await firstValueFrom(this.client.insertPendingPurchase(input));
    return res.status && res.entry ? res.entry : null;
  }

  async getPendingPurchase(pendingId: string): Promise<PendingPurchaseEntry | null> {
    const res = await firstValueFrom(this.client.getPendingPurchase({ pendingId }));
    return res.status && res.entry ? res.entry : null;
  }

  async attachPendingPurchaseToTenant(
    pendingId: string,
    tenantId: string,
    provisionedBy: 'managed' | 'self',
  ): Promise<PendingPurchaseEntry | null> {
    const res = await firstValueFrom(this.client.attachPendingPurchaseToTenant({ pendingId, tenantId, provisionedBy }));
    if (!res.status) {
      this.logger.warn(`attachPendingPurchaseToTenant failed: ${res.message}`);
      return null;
    }
    return res.entry ?? null;
  }
}
