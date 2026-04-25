import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { TenantStaffRole } from '@app/entities';
import { TenantStaffGuard } from '../common/guards/tenant-staff.guard';
import { AuditClientService } from './audit.client.service';
import { TenantAuditLogEntryType } from './dto/audit.types';

@Resolver()
export class AuditResolver {
  constructor(private readonly audit: AuditClientService) {}

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Query(() => [TenantAuditLogEntryType])
  async tenantAuditLog(@Args('tenantId') tenantId: string): Promise<TenantAuditLogEntryType[]> {
    const entries = await this.audit.listForTenant(tenantId);
    return entries.map((e) => ({
      id: e.id,
      tenantId: e.tenantId ?? undefined,
      userId: e.userId,
      action: e.action,
      payload: e.payloadJson,
      correlationId: e.correlationId ?? undefined,
      createdAt: e.createdAt,
    }));
  }
}
