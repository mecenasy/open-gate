import { Controller } from '@nestjs/common';
import {
  TenantServiceController,
  TenantServiceControllerMethods,
  GetCustomizationRequest,
  GetCustomizationResponse,
  GetTenantRequest,
  GetTenantResponse,
} from 'src/proto/tenant';
import { TenantDbService } from './tenant.service';

@Controller()
@TenantServiceControllerMethods()
export class TenantController implements TenantServiceController {
  constructor(private readonly tenantDbService: TenantDbService) {}

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
}
