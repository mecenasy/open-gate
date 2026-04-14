import { Controller } from '@nestjs/common';
import {
  TenantServiceController,
  TenantServiceControllerMethods,
  GetCustomizationRequest,
  GetCustomizationResponse,
  GetTenantRequest,
  GetTenantResponse,
  GetPlatformCredentialsRequest,
  GetPlatformCredentialsResponse,
  GetTenantsWithPlatformRequest,
  GetTenantsWithPlatformResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  GetAllTenantsResponse,
  UpdateCustomizationRequest,
  UpdateCustomizationResponse,
  UpsertPlatformCredentialsRequest,
  UpsertPlatformCredentialsResponse,
} from 'src/proto/tenant';
import { TenantDbService } from './tenant.service';
import { PlatformCredentialsService } from './platform-credentials.service';
import type { CommunityCustomization } from './entity/customization-config.entity';

@Controller()
@TenantServiceControllerMethods()
export class TenantController implements TenantServiceController {
  constructor(
    private readonly tenantDbService: TenantDbService,
    private readonly platformCredentialsService: PlatformCredentialsService,
  ) {}

  async getCustomization({ tenantId }: GetCustomizationRequest): Promise<GetCustomizationResponse> {
    const config = await this.tenantDbService.getCustomization(tenantId);
    return {
      status: true,
      message: 'Customization retrieved successfully',
      customizationJson: JSON.stringify(config),
    };
  }

  async getTenant({ tenantId }: GetTenantRequest): Promise<GetTenantResponse> {
    const tenant = await this.tenantDbService.findById(tenantId);
    if (!tenant) {
      return { status: false, message: 'Tenant not found', id: '', slug: '', schemaName: '', isActive: false };
    }
    return {
      status: true,
      message: 'Tenant retrieved successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
      isActive: tenant.isActive,
    };
  }

  async getPlatformCredentials({ tenantId, platform }: GetPlatformCredentialsRequest): Promise<GetPlatformCredentialsResponse> {
    const creds = await this.platformCredentialsService.findByTenantAndPlatform(tenantId, platform);
    if (!creds) {
      return { status: false, message: 'No credentials found', configJson: '' };
    }
    return {
      status: true,
      message: 'Credentials retrieved',
      configJson: JSON.stringify(creds.config),
    };
  }

  async getTenantsWithPlatform({ platform }: GetTenantsWithPlatformRequest): Promise<GetTenantsWithPlatformResponse> {
    const list = await this.platformCredentialsService.findTenantsWithPlatform(platform);
    return {
      status: true,
      message: 'OK',
      entries: list.map((c) => ({ tenantId: c.tenantId, configJson: JSON.stringify(c.config) })),
    };
  }

  async createTenant({ slug }: CreateTenantRequest): Promise<CreateTenantResponse> {
    const tenant = await this.tenantDbService.create(String(slug));
    return {
      status: true,
      message: 'Tenant created successfully',
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
    };
  }

  async getAllTenants(): Promise<GetAllTenantsResponse> {
    const tenants = await this.tenantDbService.findAll();
    return {
      status: true,
      message: 'OK',
      tenants: tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        schemaName: t.schemaName,
        isActive: t.isActive,
      })),
    };
  }

  async updateCustomization({
    tenantId,
    customizationJson,
  }: UpdateCustomizationRequest): Promise<UpdateCustomizationResponse> {
    const patch = JSON.parse(String(customizationJson)) as Partial<CommunityCustomization>;
    await this.tenantDbService.updateCustomization(String(tenantId), patch);
    return { status: true, message: 'Customization updated successfully' };
  }

  async upsertPlatformCredentials({
    tenantId,
    platform,
    configJson,
  }: UpsertPlatformCredentialsRequest): Promise<UpsertPlatformCredentialsResponse> {
    const config = JSON.parse(String(configJson)) as Record<string, unknown>;
    await this.platformCredentialsService.upsert(String(tenantId), String(platform), config);
    return { status: true, message: 'Platform credentials upserted successfully' };
  }
}
