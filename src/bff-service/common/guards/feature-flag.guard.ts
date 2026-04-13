import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CommunityCustomizationFeatures } from '@app/customization';
import { TenantCustomizationService } from '../customization/tenant-customization.service';

export function FeatureFlagGuard(feature: keyof CommunityCustomizationFeatures): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    constructor(readonly customizationService: TenantCustomizationService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const customization = await this.customizationService.getForCurrentTenant();
      const value = customization.features[feature];
      return typeof value === 'boolean' ? value : true;
    }
  }

  // Make the class injectable by NestJS DI
  Injectable()(Guard);
  return mixin(Guard);
}
