import { Args, Mutation, Query, Resolver, Context as GqlContext } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { TenantService } from '@app/tenant';
import { CurrentUserId } from '@app/auth';
import type { Context } from '@app/auth';
import { CacheService } from '@app/redis';
import { TenantStaffRole } from '@app/entities';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { OwnerGuard } from '../common/guards/owner.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { TenantStaffGuard } from '../common/guards/tenant-staff.guard';
import { AuditAction } from '@app/audit';
import { AuditClientService } from '../audit/audit.client.service';
import { TenantAdminService } from './tenant-admin.service';
import { TenantFeaturesType } from './dto/tenant-features.type';
import {
  AddContactInput,
  AddTenantStaffInput,
  ChangeTenantStaffRoleInput,
  ContactType,
  CreateTenantInput,
  CreateTenantResult,
  DeleteTenantCommandConfigInput,
  MutationResult,
  RemoveContactFromTenantInput,
  RemoveTenantStaffInput,
  TenantCommandConfigType,
  TenantPlatformCredentialType,
  TenantPromptOverrideType,
  TenantStaffEntryType,
  TenantStaffMembershipType,
  TenantType,
  UpdateContactInput,
  UpdateCustomizationInput,
  UpdateMyPlatformCredentialsInput,
  UpdateTenantFeaturesInput,
  UpsertPlatformCredentialsInput,
  UpsertTenantCommandConfigInput,
  UpsertTenantPromptOverrideInput,
} from './dto/tenant-admin.types';
import { UserStatusType } from '../auth/login/dto/login-status.tape';

@Resolver('Tenant')
export class TenantResolver {
  constructor(
    private readonly tenantService: TenantService,
    private readonly customizationService: TenantCustomizationService,
    private readonly tenantAdminService: TenantAdminService,
    private readonly cache: CacheService,
    private readonly audit: AuditClientService,
  ) {}

  // ── Public (auth-guarded only) ──────────────────────────────────────────────

  @Query(() => TenantFeaturesType)
  async tenantFeatures(): Promise<TenantFeaturesType> {
    const customization = await this.customizationService.getForCurrentTenant();
    return customization.features;
  }

  @UseGuards(OwnerGuard)
  @Query(() => [TenantPlatformCredentialType])
  async tenantPlatformCredentials(): Promise<TenantPlatformCredentialType[]> {
    const { tenantId } = this.tenantService.getContextOrThrow();
    const customization = await this.customizationService.getForTenant(tenantId);
    const all = await this.tenantAdminService.getTenantPlatformCredentials(tenantId);
    const ALWAYS_SHOWN = new Set(['sms', 'smtp']);
    const featureMap: Record<string, boolean> = {
      signal: customization.features.enableSignal,
      whatsapp: customization.features.enableWhatsApp,
      messenger: customization.features.enableMessenger,
    };
    return all.filter((p) => ALWAYS_SHOWN.has(p.platform) || featureMap[p.platform]);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  async updateMyPlatformCredentials(@Args('input') input: UpdateMyPlatformCredentialsInput): Promise<MutationResult> {
    const { tenantId } = this.tenantService.getContextOrThrow();
    return this.tenantAdminService.upsertPlatformCredentials(tenantId, input.platform, input.configJson);
  }

  // ── Owner-only ──────────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Query(() => [TenantType])
  async tenants(): Promise<TenantType[]> {
    return this.tenantAdminService.getAllTenants();
  }

  @Query(() => [TenantType])
  async myTenants(@CurrentUserId() userId?: string): Promise<TenantType[]> {
    if (!userId) throw new UnauthorizedException();
    return this.tenantAdminService.getMyTenants(userId);
  }

  @Query(() => Boolean)
  async tenantSlugAvailable(@Args('slug') slug: string): Promise<boolean> {
    return this.tenantAdminService.isTenantSlugAvailable(slug);
  }

  @Query(() => [TenantStaffMembershipType])
  async tenantsIStaffAt(@CurrentUserId() userId?: string): Promise<TenantStaffMembershipType[]> {
    if (!userId) throw new UnauthorizedException();
    return this.tenantAdminService.getTenantsIStaffAt(userId);
  }

  @Mutation(() => CreateTenantResult)
  async createTenant(
    @Args('input') input: CreateTenantInput,
    @CurrentUserId() userId?: string,
  ): Promise<CreateTenantResult> {
    if (!userId) throw new UnauthorizedException();
    const result = await this.tenantAdminService.createTenant(input.slug, userId);
    void this.audit.record({
      tenantId: result.id,
      userId,
      action: AuditAction.TenantCreated,
      payload: { slug: result.slug },
    });
    return result;
  }

  @Mutation(() => Boolean)
  async switchTenant(
    @Args('tenantId') tenantId: string,
    @GqlContext() ctx: Context,
    @CurrentUserId() userId?: string,
  ): Promise<boolean> {
    if (!userId) throw new UnauthorizedException();
    const { isMember } = await this.tenantAdminService.isTenantStaff(tenantId, userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this tenant');

    ctx.req.session.tenant_id = tenantId;

    const userState = await this.cache.getFromCache<UserStatusType>({
      identifier: userId,
      prefix: 'user-state',
    });
    if (userState) {
      await this.cache.saveInCache<UserStatusType>({
        identifier: userId,
        prefix: 'user-state',
        EX: 3600,
        data: { ...userState, tenantId },
      });
    }
    return true;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Query(() => [TenantStaffEntryType])
  async tenantStaff(@Args('tenantId') tenantId: string): Promise<TenantStaffEntryType[]> {
    return this.tenantAdminService.getTenantStaff(tenantId);
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async addTenantStaff(
    @Args('input') input: AddTenantStaffInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    const result = await this.tenantAdminService.addTenantStaff(input.tenantId, input.userId, input.role);
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantStaffAdded,
        payload: { addedUserId: input.userId, role: input.role },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async removeTenantStaff(
    @Args('input') input: RemoveTenantStaffInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    const result = await this.tenantAdminService.removeTenantStaff(input.tenantId, input.userId);
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantStaffRemoved,
        payload: { removedUserId: input.userId },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async changeTenantStaffRole(
    @Args('input') input: ChangeTenantStaffRoleInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    const result = await this.tenantAdminService.changeTenantStaffRole(input.tenantId, input.userId, input.role);
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantStaffRoleChanged,
        payload: { targetUserId: input.userId, newRole: input.role },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Support))
  @Query(() => [ContactType])
  async tenantContacts(@Args('tenantId') tenantId: string): Promise<ContactType[]> {
    const contacts = await this.tenantAdminService.getTenantContacts(tenantId);
    return contacts.map((c) => ({
      id: c.id,
      email: c.email || undefined,
      phone: c.phone || undefined,
      name: c.name,
      surname: c.surname || undefined,
      accessLevel: c.accessLevel || undefined,
    }));
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Support))
  @Mutation(() => ContactType)
  async addContact(@Args('input') input: AddContactInput): Promise<ContactType> {
    const res = await this.tenantAdminService.addContact({
      tenantId: input.tenantId,
      email: input.email,
      phone: input.phone,
      name: input.name,
      surname: input.surname,
      accessLevel: input.accessLevel,
    });
    if (!res.contact) throw new Error(res.message);
    return {
      id: res.contact.id,
      email: res.contact.email || undefined,
      phone: res.contact.phone || undefined,
      name: res.contact.name,
      surname: res.contact.surname || undefined,
      accessLevel: res.contact.accessLevel || undefined,
    };
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Support))
  @Mutation(() => ContactType)
  async updateContact(@Args('input') input: UpdateContactInput): Promise<ContactType> {
    const res = await this.tenantAdminService.updateContact(input.contactId, {
      email: input.email,
      phone: input.phone,
      name: input.name,
      surname: input.surname,
    });
    if (!res.contact) throw new Error(res.message);
    return {
      id: res.contact.id,
      email: res.contact.email || undefined,
      phone: res.contact.phone || undefined,
      name: res.contact.name,
      surname: res.contact.surname || undefined,
    };
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Mutation(() => MutationResult)
  async removeContactFromTenant(@Args('input') input: RemoveContactFromTenantInput): Promise<MutationResult> {
    return this.tenantAdminService.removeContactFromTenant(input.tenantId, input.contactId);
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Mutation(() => MutationResult)
  async updateTenantFeatures(@Args('input') input: UpdateTenantFeaturesInput): Promise<MutationResult> {
    const { tenantId } = input;
    const current = await this.customizationService.getForTenant(tenantId);
    const result = await this.tenantAdminService.updateFeatures(tenantId, current, input);
    this.customizationService.invalidate(tenantId);
    return result;
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  async updateTenantCustomization(@Args('input') input: UpdateCustomizationInput): Promise<MutationResult> {
    return this.tenantAdminService.updateCustomization(input.tenantId, input.customizationJson);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  async upsertPlatformCredentials(@Args('input') input: UpsertPlatformCredentialsInput): Promise<MutationResult> {
    return this.tenantAdminService.upsertPlatformCredentials(input.tenantId, input.platform, input.configJson);
  }

  // ── Command config per tenant ───────────────────────────────────────────────

  @UseGuards(OwnerGuard)
  @Query(() => [TenantCommandConfigType])
  tenantCommandConfigs(): Promise<TenantCommandConfigType[]> {
    const tenantId = this.resolveTenantId();
    return this.tenantAdminService.getTenantCommandConfigs(tenantId);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  upsertTenantCommandConfig(@Args('input') input: UpsertTenantCommandConfigInput): Promise<MutationResult> {
    const tenantId = this.resolveTenantId();
    return this.tenantAdminService.upsertTenantCommandConfig(
      tenantId,
      input.commandName,
      input.active,
      input.parametersOverrideJson,
      input.userTypes,
      input.actionsJson,
      input.descriptionI18nJson,
    );
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  deleteTenantCommandConfig(@Args('input') input: DeleteTenantCommandConfigInput): Promise<MutationResult> {
    const tenantId = this.resolveTenantId();
    return this.tenantAdminService.deleteTenantCommandConfig(tenantId, input.commandName);
  }

  private resolveTenantId(): string {
    const tenantId = this.tenantService.getContext()?.tenantId;
    if (!tenantId) throw new UnauthorizedException('Tenant context not available');
    return tenantId;
  }

  // ── Prompt overrides per tenant ─────────────────────────────────────────────

  @UseGuards(OwnerGuard)
  @Query(() => [TenantPromptOverrideType])
  tenantPromptOverrides(): Promise<TenantPromptOverrideType[]> {
    const tenantId = this.resolveTenantId();
    return this.tenantAdminService.getTenantPromptOverrides(tenantId);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  upsertTenantPromptOverride(@Args('input') input: UpsertTenantPromptOverrideInput): Promise<MutationResult> {
    const tenantId = this.resolveTenantId();
    return this.tenantAdminService.upsertTenantPromptOverride(
      tenantId,
      input.userType,
      input.prompt,
      input.commandId,
      input.descriptionI18nJson,
    );
  }
}
