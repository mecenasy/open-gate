import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import {
  PHONE_PROCUREMENT_DB_SERVICE_NAME,
  PHONE_PROCUREMENT_NOTIFY_SERVICE_NAME,
  type AvailablePhoneNumberEntry,
  type PendingPurchaseEntry,
  type PhoneProcurementDbServiceClient,
  type PhoneProcurementNotifyServiceClient,
  type TenantPhoneNumberEntry,
} from 'src/proto/phone-procurement';

interface ListAvailableInput {
  country: string;
  type?: string;
  limit?: number;
}

/**
 * Bridges the BFF resolver to the two phone-procurement gRPC services:
 * notify-service for the active provider operations (list/purchase/release)
 * and db-service for the persistence side (attach/get/list pending).
 *
 * Splits intentionally — BFF auth lives outside of gRPC, so calls are
 * always paired with an ownership check at the resolver layer before
 * crossing the wire.
 */
@Injectable()
export class PhoneProcurementClientService implements OnModuleInit {
  private notifyGrpc!: PhoneProcurementNotifyServiceClient;
  private dbGrpc!: PhoneProcurementDbServiceClient;

  constructor(
    @Inject(NotifyGrpcKey) private readonly notifyClient: ClientGrpc,
    @Inject(DbGrpcKey) private readonly dbClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.notifyGrpc = this.notifyClient.getService<PhoneProcurementNotifyServiceClient>(
      PHONE_PROCUREMENT_NOTIFY_SERVICE_NAME,
    );
    this.dbGrpc = this.dbClient.getService<PhoneProcurementDbServiceClient>(PHONE_PROCUREMENT_DB_SERVICE_NAME);
  }

  async listAvailable(input: ListAvailableInput): Promise<AvailablePhoneNumberEntry[]> {
    const res = await lastValueFrom(
      this.notifyGrpc.listAvailableNumbers({
        country: input.country,
        type: input.type ?? '',
        limit: input.limit ?? 0,
      }),
    );
    return res.status ? (res.numbers ?? []) : [];
  }

  async purchase(ownerUserId: string, country: string, phoneE164: string): Promise<PendingPurchaseEntry> {
    const res = await lastValueFrom(this.notifyGrpc.purchasePhoneNumber({ ownerUserId, country, phoneE164 }));
    if (!res.status || !res.entry) {
      throw new Error(res.message || 'Failed to purchase phone number');
    }
    return res.entry;
  }

  async release(ownerUserId: string, pendingId: string): Promise<void> {
    const res = await lastValueFrom(this.notifyGrpc.releasePendingPurchase({ pendingId, ownerUserId }));
    if (!res.status) {
      throw new Error(res.message || 'Failed to release phone number');
    }
  }

  async attachToTenant(
    pendingId: string,
    tenantId: string,
    provisionedBy: 'managed' | 'self' = 'managed',
  ): Promise<PendingPurchaseEntry> {
    const res = await lastValueFrom(this.dbGrpc.attachPendingPurchaseToTenant({ pendingId, tenantId, provisionedBy }));
    if (!res.status || !res.entry) {
      throw new Error(res.message || 'Failed to attach phone number to tenant');
    }
    return res.entry;
  }

  async getPending(pendingId: string): Promise<PendingPurchaseEntry | null> {
    const res = await lastValueFrom(this.dbGrpc.getPendingPurchase({ pendingId }));
    return res.status && res.entry ? res.entry : null;
  }

  async getTenantPhoneNumber(tenantId: string): Promise<TenantPhoneNumberEntry | null> {
    const res = await lastValueFrom(this.dbGrpc.getTenantPhoneNumber({ tenantId }));
    return res.status && res.entry ? res.entry : null;
  }

  async getProviderInfo(): Promise<{ providerKey: string; isSandbox: boolean }> {
    const res = await lastValueFrom(this.notifyGrpc.getActiveProviderInfo({}));
    return { providerKey: res.providerKey, isSandbox: res.isSandbox };
  }

  async getSignalVerificationCode(phoneE164: string): Promise<{ code: string; receivedAt: string } | null> {
    const res = await lastValueFrom(this.notifyGrpc.getSignalVerificationCode({ phoneE164 }));
    if (!res.status || !res.code) return null;
    return { code: res.code, receivedAt: res.receivedAt };
  }
}
