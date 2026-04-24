import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantStaff, TenantStaffRole, Tenant } from '@app/entities';

@Injectable()
export class TenantStaffService {
  constructor(
    @InjectRepository(TenantStaff)
    private readonly staffRepo: Repository<TenantStaff>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  findMembership(tenantId: string, userId: string): Promise<TenantStaff | null> {
    return this.staffRepo.findOne({ where: { tenantId, userId } });
  }

  async listForTenant(tenantId: string): Promise<Array<TenantStaff & { tenantSlug: string }>> {
    const rows = await this.staffRepo
      .createQueryBuilder('s')
      .innerJoin(Tenant, 't', 't.id = s.tenant_id')
      .where('s.tenant_id = :tenantId', { tenantId })
      .select(['s.tenant_id', 's.user_id', 's.role', 's.created_at', 's.updated_at', 't.slug'])
      .getRawMany<{
        s_tenant_id: string;
        s_user_id: string;
        s_role: TenantStaffRole;
        t_slug: string;
      }>();
    return rows.map((r) => ({
      tenantId: r.s_tenant_id,
      userId: r.s_user_id,
      role: r.s_role,
      tenantSlug: r.t_slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async listForUser(userId: string): Promise<Array<{ tenantId: string; role: TenantStaffRole; tenantSlug: string }>> {
    const rows = await this.staffRepo
      .createQueryBuilder('s')
      .innerJoin(Tenant, 't', 't.id = s.tenant_id')
      .where('s.user_id = :userId', { userId })
      .select(['s.tenant_id AS "tenantId"', 's.role AS "role"', 't.slug AS "tenantSlug"'])
      .getRawMany<{ tenantId: string; role: TenantStaffRole; tenantSlug: string }>();
    return rows;
  }

  async add(tenantId: string, userId: string, role: TenantStaffRole): Promise<TenantStaff> {
    const entry = this.staffRepo.create({ tenantId, userId, role });
    return this.staffRepo.save(entry);
  }

  async remove(tenantId: string, userId: string): Promise<boolean> {
    const result = await this.staffRepo.delete({ tenantId, userId });
    return (result.affected ?? 0) > 0;
  }

  async changeRole(tenantId: string, userId: string, role: TenantStaffRole): Promise<TenantStaff | null> {
    const existing = await this.findMembership(tenantId, userId);
    if (!existing) return null;
    existing.role = role;
    return this.staffRepo.save(existing);
  }

  async countForTenant(tenantId: string): Promise<number> {
    return this.staffRepo.count({ where: { tenantId } });
  }
}
