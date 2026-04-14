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
} from 'src/proto/tenant';
import { TenantDbService } from './tenant.service';
import { PlatformCredentialsService } from './platform-credentials.service';

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
}
