import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { TenantPhoneNumber } from '@app/entities';
import { GetTenantPhoneByTenantQuery } from '../impl/get-tenant-phone-by-tenant.query';

@QueryHandler(GetTenantPhoneByTenantQuery)
export class GetTenantPhoneByTenantHandler extends BaseQueryHandler<
  GetTenantPhoneByTenantQuery,
  TenantPhoneNumber | null
> {
  constructor(
    @InjectRepository(TenantPhoneNumber)
    private readonly repo: Repository<TenantPhoneNumber>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetTenantPhoneByTenantQuery): Promise<TenantPhoneNumber | null> {
    return this.run('GetTenantPhoneByTenant', () => this.repo.findOne({ where: { tenantId: query.tenantId } }));
  }
}
