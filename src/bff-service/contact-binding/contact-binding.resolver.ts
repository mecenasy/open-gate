import { ForbiddenException, Logger, UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '@app/auth';
import { BindingPlatform, ContactBindingSource, ContactBindingSendStatus, TenantStaffRole } from '@app/entities';
import type { BindingEntry, SendBindingInviteResponse } from 'src/proto/contact-binding';
import { TenantAdminService } from '../tenant/tenant-admin.service';
import { ContactBindingClientService } from './contact-binding.client.service';
import {
  ContactBindingType,
  RequestHouseholdBindingInput,
  RequestOperatorBindingInput,
} from './dto/contact-binding.types';

const TENANT_INVITE_ROLES: ReadonlySet<string> = new Set([
  TenantStaffRole.Owner,
  TenantStaffRole.Admin,
  TenantStaffRole.Support,
]);

/**
 * Contact binding surface for the operator UI:
 *   - requestSignalBinding: operator (tenant staff) invites someone by phone
 *     to the tenant's Signal channel.
 *   - requestHouseholdSignalBinding: any logged-in user adds a household
 *     member; the new user is created with ownerId = currentUser.id and
 *     stays status='pending' until a staff member activates them.
 *   - pendingBindings: list still-open invites for the tenant (operator
 *     dashboard).
 *   - revokeBinding: cancel an outstanding invite.
 *
 * Side effect of every successful create: triggers SendBindingInvite on
 * notify-service. Failure to send is recorded on the binding row but
 * doesn't fail the mutation — the operator can re-trigger via UI.
 */
@Resolver()
export class ContactBindingResolver {
  private readonly logger = new Logger(ContactBindingResolver.name);

  constructor(
    private readonly client: ContactBindingClientService,
    private readonly tenantAdmin: TenantAdminService,
  ) {}

  @Mutation(() => ContactBindingType)
  async requestSignalBinding(
    @Args('input') input: RequestOperatorBindingInput,
    @CurrentUserId() userId?: string,
  ): Promise<ContactBindingType> {
    if (!userId) throw new UnauthorizedException();

    const { isMember, role } = await this.tenantAdmin.isTenantStaff(input.tenantId, userId);
    if (!isMember || !role || !TENANT_INVITE_ROLES.has(role)) {
      throw new ForbiddenException('You are not allowed to invite contacts for this tenant.');
    }

    const subject = await this.client.findOrCreateUserByPhone(input.phoneE164, {
      name: input.name,
      email: input.email,
      // Operator-added: ownerId stays NULL (= "operator-added" by convention).
    });

    const binding = await this.client.createBinding({
      tenantId: input.tenantId,
      userId: subject.id,
      phoneE164: input.phoneE164,
      platform: BindingPlatform.Signal,
      source: ContactBindingSource.OperatorFrontend,
    });

    await this.dispatchInvite(binding, await this.tenantNameOrFallback(input.tenantId));
    return toType(binding);
  }

  @Mutation(() => ContactBindingType)
  async requestHouseholdSignalBinding(
    @Args('input') input: RequestHouseholdBindingInput,
    @CurrentUserId() userId?: string,
  ): Promise<ContactBindingType> {
    if (!userId) throw new UnauthorizedException();

    // Household members live under the tenant of the currently active
    // staff/user. We look up the caller's tenant via tenant_staff (the
    // first one — multi-tenant household support is out of scope for MVP).
    const tenants = await this.tenantAdmin.getMyTenants(userId);
    const primary = tenants[0];
    if (!primary) {
      throw new ForbiddenException('You are not assigned to any tenant.');
    }

    const subject = await this.client.findOrCreateUserByPhone(input.phoneE164, {
      name: input.name,
      email: input.email,
      ownerId: userId,
    });

    const binding = await this.client.createBinding({
      tenantId: primary.id,
      userId: subject.id,
      phoneE164: input.phoneE164,
      platform: BindingPlatform.Signal,
      source: ContactBindingSource.HouseholdInvite,
    });

    await this.dispatchInvite(binding, primary.slug);
    return toType(binding);
  }

  @Query(() => [ContactBindingType])
  async pendingBindings(
    @Args('tenantId') tenantId: string,
    @CurrentUserId() userId?: string,
  ): Promise<ContactBindingType[]> {
    if (!userId) throw new UnauthorizedException();
    const { isMember } = await this.tenantAdmin.isTenantStaff(tenantId, userId);
    if (!isMember) throw new ForbiddenException('Not a member of this tenant.');
    const rows = await this.client.listPending(tenantId);
    return rows.map(toType);
  }

  @Mutation(() => ContactBindingType)
  async revokeBinding(@Args('id') id: string, @CurrentUserId() userId?: string): Promise<ContactBindingType> {
    if (!userId) throw new UnauthorizedException();
    const existing = await this.client.getBinding(id);
    if (!existing) throw new ForbiddenException('Binding not found.');
    const { isMember, role } = await this.tenantAdmin.isTenantStaff(existing.tenantId, userId);
    if (!isMember || !role || !TENANT_INVITE_ROLES.has(role)) {
      throw new ForbiddenException('You are not allowed to manage this binding.');
    }
    const revoked = await this.client.revoke(id);
    if (!revoked) throw new ForbiddenException('Binding could not be revoked.');
    return toType(revoked);
  }

  private async dispatchInvite(binding: BindingEntry, tenantName: string): Promise<void> {
    let result: SendBindingInviteResponse;
    try {
      result = await this.client.sendInvite({
        bindingId: binding.id,
        tenantId: binding.tenantId,
        phoneE164: binding.phoneE164,
        platform: binding.platform,
        token: binding.token,
        tenantName,
      });
    } catch (err) {
      this.logger.warn(`SendBindingInvite ${binding.id} threw: ${(err as Error).message}`);
      await this.client.updateSendStatus(
        binding.id,
        ContactBindingSendStatus.Failed,
        null,
        (err as Error).message.slice(0, 500),
      );
      return;
    }
    await this.client.updateSendStatus(
      binding.id,
      result.sendStatus,
      result.outboundMessageId || null,
      result.status ? null : result.message,
    );
  }

  private async tenantNameOrFallback(tenantId: string): Promise<string> {
    const t = await this.tenantAdmin.getTenantById(tenantId);
    return t?.slug || 'Open Gate';
  }
}

function toType(b: BindingEntry): ContactBindingType {
  return {
    id: b.id,
    tenantId: b.tenantId,
    userId: b.userId,
    phoneE164: b.phoneE164,
    token: b.token,
    platform: b.platform,
    status: b.status,
    source: b.source,
    sendStatus: b.sendStatus,
    sendError: b.sendError || undefined,
    expiresAt: b.expiresAt,
    verifiedAt: b.verifiedAt || undefined,
    createdAt: b.createdAt,
  };
}
