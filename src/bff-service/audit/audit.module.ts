import { Module } from '@nestjs/common';
import { AuditClientService } from './audit.client.service';

@Module({
  // AuditResolver lives in TenantBffModule because its TenantStaffGuard
  // depends on TenantAdminService — keeping it here would create a
  // hard cycle (TenantBffModule imports this module to write audit
  // entries from its own mutations).
  providers: [AuditClientService],
  exports: [AuditClientService],
})
export class AuditBffModule {}
