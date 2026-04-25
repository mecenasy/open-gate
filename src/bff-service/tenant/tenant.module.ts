import { Module } from '@nestjs/common';
import { TenantModule } from '@app/tenant';
import { TenantResolver } from './tenant.resolver';
import { TenantSettingsResolver } from './tenant-settings.resolver';
import { TenantAdminService } from './tenant-admin.service';
import { TenantCustomizationModule } from '../common/customization/tenant-customization.module';
import { OwnerGuard } from '../common/guards/owner.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { QuotasBffModule } from '../quotas/quotas.module';
import { AuditBffModule } from '../audit/audit.module';

@Module({
  imports: [TenantModule, TenantCustomizationModule, QuotasBffModule, AuditBffModule],
  providers: [TenantResolver, TenantSettingsResolver, TenantAdminService, OwnerGuard, AdminGuard],
  exports: [TenantAdminService],
})
export class TenantBffModule {}
