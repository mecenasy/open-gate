import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AttachPendingPurchaseToTenantRequest,
  DeletePendingPurchaseRequest,
  GetPendingPurchaseRequest,
  GetTenantPhoneNumberByE164Request,
  GetTenantPhoneNumberRequest,
  GetTenantPhoneNumberResponse,
  HasSmsSyncLogForDateRequest,
  HasSmsSyncLogForDateResponse,
  IncrementMonthlyMessageCountRequest,
  InsertPendingPurchaseRequest,
  InsertSmsSyncLogRequest,
  ListManagedPhoneNumbersRequest,
  ListManagedPhoneNumbersResponse,
  ListUnattachedPendingPurchasesRequest,
  ListUnattachedPendingPurchasesResponse,
  MutationResponse,
  PendingPurchaseEntry,
  PendingPurchaseResponse,
  PhoneProcurementDbServiceController,
  PhoneProcurementDbServiceControllerMethods,
  ResetAllMonthlyMessageCountsRequest,
  TenantPhoneNumberEntry,
} from 'src/proto/phone-procurement';
import { PendingPhonePurchase, PhoneProvisionedBy, TenantPhoneNumber } from '@app/entities';
import { GetTenantPhoneByE164Query } from './queries/impl/get-tenant-phone-by-e164.query';
import { GetTenantPhoneByTenantQuery } from './queries/impl/get-tenant-phone-by-tenant.query';
import { ListManagedPhoneNumbersQuery } from './queries/impl/list-managed-phone-numbers.query';
import { HasSmsSyncLogQuery } from './queries/impl/has-sms-sync-log.query';
import { GetPendingPurchaseQuery } from './queries/impl/get-pending-purchase.query';
import { ListUnattachedPendingPurchasesQuery } from './queries/impl/list-unattached-pending-purchases.query';
import { IncrementMonthlyMessageCountCommand } from './commands/impl/increment-monthly-message-count.command';
import { ResetAllMonthlyMessageCountsCommand } from './commands/impl/reset-all-monthly-message-counts.command';
import { InsertSmsSyncLogCommand } from './commands/impl/insert-sms-sync-log.command';
import { InsertPendingPurchaseCommand } from './commands/impl/insert-pending-purchase.command';
import { AttachPendingPurchaseCommand } from './commands/impl/attach-pending-purchase.command';
import { DeletePendingPurchaseCommand } from './commands/impl/delete-pending-purchase.command';

/**
 * gRPC adapter — translates wire format ↔ command/query bus calls. All
 * actual logic lives in handlers; this file is a transport shell.
 */
@Controller()
@PhoneProcurementDbServiceControllerMethods()
export class PhoneProcurementController implements PhoneProcurementDbServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getTenantPhoneNumberByE164({
    phoneE164,
  }: GetTenantPhoneNumberByE164Request): Promise<GetTenantPhoneNumberResponse> {
    const row = await this.queryBus.execute<GetTenantPhoneByE164Query, TenantPhoneNumber | null>(
      new GetTenantPhoneByE164Query(phoneE164),
    );
    return rowToTenantPhoneResponse(row);
  }

  async getTenantPhoneNumber({ tenantId }: GetTenantPhoneNumberRequest): Promise<GetTenantPhoneNumberResponse> {
    const row = await this.queryBus.execute<GetTenantPhoneByTenantQuery, TenantPhoneNumber | null>(
      new GetTenantPhoneByTenantQuery(tenantId),
    );
    return rowToTenantPhoneResponse(row);
  }

  async listManagedPhoneNumbers(_: ListManagedPhoneNumbersRequest): Promise<ListManagedPhoneNumbersResponse> {
    const rows = await this.queryBus.execute<ListManagedPhoneNumbersQuery, TenantPhoneNumber[]>(
      new ListManagedPhoneNumbersQuery(),
    );
    return { status: true, message: 'OK', entries: rows.map(toTenantPhoneEntry) };
  }

  async incrementMonthlyMessageCount({
    tenantId,
    delta,
    syncedAt,
  }: IncrementMonthlyMessageCountRequest): Promise<MutationResponse> {
    await this.commandBus.execute<IncrementMonthlyMessageCountCommand, void>(
      new IncrementMonthlyMessageCountCommand(tenantId, delta, parseIso(syncedAt) ?? new Date()),
    );
    return { status: true, message: 'OK' };
  }

  async resetAllMonthlyMessageCounts(_: ResetAllMonthlyMessageCountsRequest): Promise<MutationResponse> {
    await this.commandBus.execute<ResetAllMonthlyMessageCountsCommand, void>(new ResetAllMonthlyMessageCountsCommand());
    return { status: true, message: 'OK' };
  }

  async hasSmsSyncLogForDate({
    tenantId,
    syncDate,
  }: HasSmsSyncLogForDateRequest): Promise<HasSmsSyncLogForDateResponse> {
    const exists = await this.queryBus.execute<HasSmsSyncLogQuery, boolean>(new HasSmsSyncLogQuery(tenantId, syncDate));
    return { status: true, message: 'OK', exists };
  }

  async insertSmsSyncLog({ tenantId, syncDate, messagesCounted }: InsertSmsSyncLogRequest): Promise<MutationResponse> {
    await this.commandBus.execute<InsertSmsSyncLogCommand, void>(
      new InsertSmsSyncLogCommand(tenantId, syncDate, messagesCounted),
    );
    return { status: true, message: 'OK' };
  }

  async insertPendingPurchase(req: InsertPendingPurchaseRequest): Promise<PendingPurchaseResponse> {
    const row = await this.commandBus.execute<InsertPendingPurchaseCommand, PendingPhonePurchase>(
      new InsertPendingPurchaseCommand(req.ownerUserId, req.providerKey, req.providerExternalId, req.phoneE164),
    );
    return { status: true, message: 'OK', entry: toPendingEntry(row) };
  }

  async attachPendingPurchaseToTenant(req: AttachPendingPurchaseToTenantRequest): Promise<PendingPurchaseResponse> {
    const provisionedBy = parseProvisionedBy(req.provisionedBy);
    if (!provisionedBy) {
      return { status: false, message: `Unknown provisioned_by="${req.provisionedBy}"`, entry: undefined };
    }
    const attached = await this.commandBus.execute<AttachPendingPurchaseCommand, PendingPhonePurchase | null>(
      new AttachPendingPurchaseCommand(req.pendingId, req.tenantId, provisionedBy),
    );
    if (!attached) {
      return { status: false, message: 'Pending purchase not found or already attached', entry: undefined };
    }
    return { status: true, message: 'OK', entry: toPendingEntry(attached) };
  }

  async deletePendingPurchase({ pendingId }: DeletePendingPurchaseRequest): Promise<MutationResponse> {
    await this.commandBus.execute<DeletePendingPurchaseCommand, void>(new DeletePendingPurchaseCommand(pendingId));
    return { status: true, message: 'OK' };
  }

  async listUnattachedPendingPurchases({
    cutoffIso,
  }: ListUnattachedPendingPurchasesRequest): Promise<ListUnattachedPendingPurchasesResponse> {
    const cutoff = parseIso(cutoffIso) ?? new Date();
    const rows = await this.queryBus.execute<ListUnattachedPendingPurchasesQuery, PendingPhonePurchase[]>(
      new ListUnattachedPendingPurchasesQuery(cutoff),
    );
    return { status: true, message: 'OK', entries: rows.map(toPendingEntry) };
  }

  async getPendingPurchase({ pendingId }: GetPendingPurchaseRequest): Promise<PendingPurchaseResponse> {
    const row = await this.queryBus.execute<GetPendingPurchaseQuery, PendingPhonePurchase | null>(
      new GetPendingPurchaseQuery(pendingId),
    );
    if (!row) return { status: false, message: 'Not found', entry: undefined };
    return { status: true, message: 'OK', entry: toPendingEntry(row) };
  }
}

function toTenantPhoneEntry(row: TenantPhoneNumber): TenantPhoneNumberEntry {
  return {
    id: row.id,
    tenantId: row.tenantId,
    phoneE164: row.phoneE164,
    providerKey: row.providerKey,
    providerExternalId: row.providerExternalId,
    provisionedBy: row.provisionedBy,
    monthlyMessageCount: row.monthlyMessageCount,
    lastSyncedAt: row.lastSyncedAt ? row.lastSyncedAt.toISOString() : '',
    purchasedAt: row.purchasedAt.toISOString(),
  };
}

function rowToTenantPhoneResponse(row: TenantPhoneNumber | null): GetTenantPhoneNumberResponse {
  if (!row) return { status: false, message: 'Not found', entry: undefined };
  return { status: true, message: 'OK', entry: toTenantPhoneEntry(row) };
}

function toPendingEntry(row: PendingPhonePurchase): PendingPurchaseEntry {
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    providerKey: row.providerKey,
    providerExternalId: row.providerExternalId,
    phoneE164: row.phoneE164,
    attachedToTenantId: row.attachedToTenantId ?? '',
    purchasedAt: row.purchasedAt.toISOString(),
    attachedAt: row.attachedAt ? row.attachedAt.toISOString() : '',
  };
}

function parseProvisionedBy(value: string): PhoneProvisionedBy | null {
  if (value === PhoneProvisionedBy.Managed) return PhoneProvisionedBy.Managed;
  if (value === PhoneProvisionedBy.Self) return PhoneProvisionedBy.Self;
  return null;
}

function parseIso(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
