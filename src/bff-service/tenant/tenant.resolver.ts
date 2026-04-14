import { Query, Resolver } from '@nestjs/graphql';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { TenantFeaturesType } from './dto/tenant-features.type';

@Resolver('Tenant')
export class TenantResolver {
  constructor(private readonly customizationService: TenantCustomizationService) {}

  @Query(() => TenantFeaturesType)
  async tenantFeatures(): Promise<TenantFeaturesType> {
    const customization = await this.customizationService.getForCurrentTenant();
    return customization.features;
  }
}
