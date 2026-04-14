import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { OwnerGuard } from '../common/guards/owner.guard';
import { TenantAdminService } from './tenant-admin.service';
import { TenantFeaturesType } from './dto/tenant-features.type';
import {
  CreateTenantInput,
  CreateTenantResult,
  MutationResult,
  TenantType,
  UpdateCustomizationInput,
  UpsertPlatformCredentialsInput,
} from './dto/tenant-admin.types';

@Resolver('Tenant')
export class TenantResolver {
  constructor(
    private readonly customizationService: TenantCustomizationService,
    private readonly tenantAdminService: TenantAdminService,
  ) {}

  @Query(() => TenantFeaturesType)
  async tenantFeatures(): Promise<TenantFeaturesType> {
    const customization = await this.customizationService.getForCurrentTenant();
    return customization.features;
  }

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
  async updateTenantCustomization(@Args('input') input: UpdateCustomizationInput): Promise<MutationResult> {
    return this.tenantAdminService.updateCustomization(input.tenantId, input.customizationJson);
  }

  @UseGuards(OwnerGuard)
  @Mutation(() => MutationResult)
  async upsertPlatformCredentials(@Args('input') input: UpsertPlatformCredentialsInput): Promise<MutationResult> {
    return this.tenantAdminService.upsertPlatformCredentials(input.tenantId, input.platform, input.configJson);
  }
}
