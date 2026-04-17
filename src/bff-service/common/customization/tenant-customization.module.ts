import { Module } from '@nestjs/common';
import { TenantModule } from '@app/tenant';
import { TenantCustomizationService } from './tenant-customization.service';

@Module({
  imports: [TenantModule],
  providers: [TenantCustomizationService],
  exports: [TenantCustomizationService],
})
export class TenantCustomizationModule {}
