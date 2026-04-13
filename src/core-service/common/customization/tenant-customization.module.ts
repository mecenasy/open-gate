import { Module } from '@nestjs/common';
import { TenantCustomizationService } from './tenant-customization.service';

@Module({
  providers: [TenantCustomizationService],
  exports: [TenantCustomizationService],
})
export class TenantCustomizationModule {}
