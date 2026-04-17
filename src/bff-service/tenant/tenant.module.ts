import { Module } from '@nestjs/common';
import { TenantModule } from '@app/tenant';
import { TenantResolver } from './tenant.resolver';
import { TenantAdminService } from './tenant-admin.service';
import { TenantCustomizationModule } from '../common/customization/tenant-customization.module';
import { OwnerGuard } from '../common/guards/owner.guard';

@Module({
  imports: [TenantModule, TenantCustomizationModule],
  providers: [TenantResolver, TenantAdminService, OwnerGuard],
})
export class TenantBffModule {}
