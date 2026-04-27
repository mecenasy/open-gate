import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { TenantPhoneNumber } from '@app/entities';
import { GetTenantPhoneByE164Query } from '../impl/get-tenant-phone-by-e164.query';

@QueryHandler(GetTenantPhoneByE164Query)
export class GetTenantPhoneByE164Handler extends BaseQueryHandler<GetTenantPhoneByE164Query, TenantPhoneNumber | null> {
  constructor(
    @InjectRepository(TenantPhoneNumber)
    private readonly repo: Repository<TenantPhoneNumber>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetTenantPhoneByE164Query): Promise<TenantPhoneNumber | null> {
    return this.run('GetTenantPhoneByE164', () => this.repo.findOne({ where: { phoneE164: query.phoneE164 } }));
  }
}
