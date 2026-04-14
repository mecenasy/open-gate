import { Module } from '@nestjs/common';
import { TenantResolver } from './tenant.resolver';
import { TenantCustomizationModule } from '../common/customization/tenant-customization.module';

@Module({
  imports: [TenantCustomizationModule],
  providers: [TenantResolver],
})
export class TenantBffModule {}
