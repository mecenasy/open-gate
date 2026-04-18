import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { TenantService } from '@app/tenant';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { OwnerGuard } from '../common/guards/owner.guard';
import { TenantAdminService } from './tenant-admin.service';
import { TenantFeaturesType } from './dto/tenant-features.type';
import {
  CreateTenantInput,
  CreateTenantResult,
  DeleteTenantCommandConfigInput,
  MutationResult,
  TenantCommandConfigType,
  TenantPlatformCredentialType,
  TenantPromptOverrideType,
  TenantType,
  UpdateCustomizationInput,
  UpdateMyPlatformCredentialsInput,
  UpdateTenantFeaturesInput,
  UpsertPlatformCredentialsInput,
  UpsertTenantCommandConfigInput,
  UpsertTenantPromptOverrideInput,
} from './dto/tenant-admin.types';

@Resolver('Tenant')
export class TenantResolver {
  constructor(
    private readonly tenantService: TenantService,
    private readonly customizationService: TenantCustomizationService,
    private readonly tenantAdminService: TenantAdminService,
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

  @UseGuards(OwnerGuard)
  @Query(() => [TenantType])
  async tenants(): Promise<TenantType[]> {
    return this.tenantAdminService.getAllTenants();
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => CreateTenantResult)
  async createTenant(@Args('input') input: CreateTenantInput): Promise<CreateTenantResult> {
    return this.tenantAdminService.createTenant(input.slug);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  async updateTenantFeatures(@Args('input') input: UpdateTenantFeaturesInput): Promise<MutationResult> {
    const { tenantId } = this.tenantService.getContextOrThrow();
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
