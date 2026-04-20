import { CanActivate, ExecutionContext, ForbiddenException, Injectable, mixin, Type } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CacheService } from '@app/redis';
import { Context } from '@app/auth';
import { TenantStaffRole } from '@app/entities';
import { TenantAdminService } from 'src/bff-service/tenant/tenant-admin.service';

const ROLE_RANK: Record<TenantStaffRole, number> = {
  [TenantStaffRole.Support]: 1,
  [TenantStaffRole.Admin]: 2,
  [TenantStaffRole.Owner]: 3,
};

function normalizeRole(value: string | null): TenantStaffRole | null {
  if (value === TenantStaffRole.Owner) return TenantStaffRole.Owner;
  if (value === TenantStaffRole.Admin) return TenantStaffRole.Admin;
  if (value === TenantStaffRole.Support) return TenantStaffRole.Support;
  return null;
}

export function TenantStaffGuard(minRole: TenantStaffRole = TenantStaffRole.Support): Type<CanActivate> {
  @Injectable()
  class Guard implements CanActivate {
    constructor(
      readonly cache: CacheService,
      readonly tenantAdminService: TenantAdminService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const gqlContext = ctx.getContext<Context>();
      const request = gqlContext.req;
      const userId = request.session.user_id;

      if (!userId) {
        throw new ForbiddenException('Access denied');
      }

      const args = ctx.getArgs<{ tenantId?: string; input?: { tenantId?: string } }>();
      const tenantId = args.tenantId ?? args.input?.tenantId ?? request.session.tenant_id;

      if (!tenantId) {
        throw new ForbiddenException('Tenant context required');
      }

      const { isMember, role } = await this.tenantAdminService.isTenantStaff(tenantId, userId);
      if (!isMember || !role) {
        throw new ForbiddenException('Access denied: not a tenant staff member');
      }

      const normalized = normalizeRole(role);
      if (!normalized) {
        throw new ForbiddenException('Access denied: unknown tenant staff role');
      }

      if (ROLE_RANK[normalized] < ROLE_RANK[minRole]) {
        throw new ForbiddenException(`Access denied: ${minRole} role required`);
      }

      return true;
    }
  }

  return mixin(Guard);
}
