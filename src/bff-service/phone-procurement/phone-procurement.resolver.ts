import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '@app/auth';
import { TenantStaffRole } from '@app/entities';
import { TenantAdminService } from '../tenant/tenant-admin.service';
import { SubscriptionClientService } from '../subscription/subscription.service';
import { PhoneProcurementClientService } from './phone-procurement.client.service';
import {
  AttachPhoneToTenantInput,
  AvailablePhoneNumberType,
  ListAvailablePhoneNumbersInput,
  PendingPhonePurchaseType,
  PhoneProcurementInfoType,
  PurchasePhoneNumberInput,
  TenantPhoneNumberType,
} from './dto/phone-procurement.types';

const TENANT_MANAGE_ROLES: ReadonlySet<string> = new Set([TenantStaffRole.Owner, TenantStaffRole.Admin]);

/**
 * Phone procurement surface for the wizard:
 *   - phoneProcurementInfo: tells the frontend whether sandbox banner shows.
 *   - availablePhoneNumbers: pulls 10 candidates from the active provider.
 *   - purchasePhoneNumber: buys via the provider, persists a pending row
 *     owned by the caller. Plan must allow at least 1 included number.
 *   - attachPhoneToTenant: binds an owned pending row to a tenant the
 *     caller manages. Either both succeed or neither (db transaction).
 *   - releasePendingPurchase: caller-owner releases their own unattached
 *     pending row (e.g. user wandered away from the wizard's pick step
 *     and wants to abandon the purchase before the cleanup cron runs).
 *   - tenantPhoneNumber: settings query — current managed phone for tenant.
 *
 * Auth:
 *   - All operations require an authenticated user.
 *   - purchase/release: caller must own the pending row.
 *   - attach: caller must Owner/Admin the target tenant.
 *   - tenantPhoneNumber: caller must staff the tenant.
 */
@Resolver()
export class PhoneProcurementResolver {
  constructor(
    private readonly client: PhoneProcurementClientService,
    private readonly tenantAdmin: TenantAdminService,
    private readonly subscriptions: SubscriptionClientService,
  ) {}

  @Query(() => PhoneProcurementInfoType)
  async phoneProcurementInfo(): Promise<PhoneProcurementInfoType> {
    return this.client.getProviderInfo();
  }

  @Query(() => [AvailablePhoneNumberType])
  async availablePhoneNumbers(
    @Args('input') input: ListAvailablePhoneNumbersInput,
    @CurrentUserId() userId?: string,
  ): Promise<AvailablePhoneNumberType[]> {
    if (!userId) throw new UnauthorizedException();
    const numbers = await this.client.listAvailable({
      country: input.country,
      type: input.type,
      limit: input.limit,
    });
    return numbers.map((n) => ({
      phoneE164: n.phoneE164,
      capabilities: n.capabilities ?? { sms: false, mms: false, voice: false },
      region: n.region || undefined,
      locality: n.locality || undefined,
    }));
  }

  @Query(() => TenantPhoneNumberType, { nullable: true })
  async tenantPhoneNumber(
    @Args('tenantId') tenantId: string,
    @CurrentUserId() userId?: string,
  ): Promise<TenantPhoneNumberType | null> {
    if (!userId) throw new UnauthorizedException();
    const { isMember } = await this.tenantAdmin.isTenantStaff(tenantId, userId);
    if (!isMember) throw new ForbiddenException('Not a member of this tenant.');
    const row = await this.client.getTenantPhoneNumber(tenantId);
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenantId,
      phoneE164: row.phoneE164,
      providerKey: row.providerKey,
      provisionedBy: row.provisionedBy,
      monthlyMessageCount: row.monthlyMessageCount,
      lastSyncedAt: row.lastSyncedAt || undefined,
      purchasedAt: row.purchasedAt,
    };
  }

  @Mutation(() => PendingPhonePurchaseType)
  async purchasePhoneNumber(
    @Args('input') input: PurchasePhoneNumberInput,
    @CurrentUserId() userId?: string,
  ): Promise<PendingPhonePurchaseType> {
    if (!userId) throw new UnauthorizedException();
    const plan = await this.subscriptions.getLimitsForUser(userId);
    if (!plan || plan.phoneNumbersIncluded < 1) {
      throw new BadRequestException(
        'Your plan does not include a managed phone number. Upgrade to access the managed flow.',
      );
    }
    const entry = await this.client.purchase(userId, input.country, input.phoneE164);
    return toPendingType(entry);
  }

  @Mutation(() => PendingPhonePurchaseType)
  async attachPhoneToTenant(
    @Args('input') input: AttachPhoneToTenantInput,
    @CurrentUserId() userId?: string,
  ): Promise<PendingPhonePurchaseType> {
    if (!userId) throw new UnauthorizedException();

    const pending = await this.client.getPending(input.pendingId);
    if (!pending) throw new NotFoundException('Pending purchase not found.');
    if (pending.ownerUserId !== userId) {
      throw new ForbiddenException('You do not own this pending purchase.');
    }
    if (pending.attachedToTenantId) {
      throw new BadRequestException('Pending purchase is already attached.');
    }

    const { isMember, role } = await this.tenantAdmin.isTenantStaff(input.tenantId, userId);
    if (!isMember || !role || !TENANT_MANAGE_ROLES.has(role)) {
      throw new ForbiddenException('You are not allowed to manage phone numbers for this tenant.');
    }

    const existing = await this.client.getTenantPhoneNumber(input.tenantId);
    if (existing) {
      throw new BadRequestException('This tenant already has a phone number attached.');
    }

    const attached = await this.client.attachToTenant(input.pendingId, input.tenantId);
    return toPendingType(attached);
  }

  @Mutation(() => Boolean)
  async releasePendingPurchase(
    @Args('pendingId') pendingId: string,
    @CurrentUserId() userId?: string,
  ): Promise<boolean> {
    if (!userId) throw new UnauthorizedException();
    const pending = await this.client.getPending(pendingId);
    if (!pending) return true;
    if (pending.ownerUserId !== userId) {
      throw new ForbiddenException('You do not own this pending purchase.');
    }
    if (pending.attachedToTenantId) {
      throw new BadRequestException('Cannot release an attached purchase — release the tenant phone instead.');
    }
    await this.client.release(userId, pendingId);
    return true;
  }
}

function toPendingType(entry: {
  id: string;
  ownerUserId: string;
  providerKey: string;
  phoneE164: string;
  attachedToTenantId: string;
  purchasedAt: string;
  attachedAt: string;
}): PendingPhonePurchaseType {
  return {
    id: entry.id,
    ownerUserId: entry.ownerUserId,
    providerKey: entry.providerKey,
    phoneE164: entry.phoneE164,
    attachedToTenantId: entry.attachedToTenantId || undefined,
    purchasedAt: entry.purchasedAt,
    attachedAt: entry.attachedAt || undefined,
  };
}
