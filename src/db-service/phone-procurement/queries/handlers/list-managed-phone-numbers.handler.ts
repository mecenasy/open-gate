import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { PhoneProvisionedBy, TenantPhoneNumber } from '@app/entities';
import { ListManagedPhoneNumbersQuery } from '../impl/list-managed-phone-numbers.query';

@QueryHandler(ListManagedPhoneNumbersQuery)
export class ListManagedPhoneNumbersHandler extends BaseQueryHandler<
  ListManagedPhoneNumbersQuery,
  TenantPhoneNumber[]
> {
  constructor(
    @InjectRepository(TenantPhoneNumber)
    private readonly repo: Repository<TenantPhoneNumber>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(): Promise<TenantPhoneNumber[]> {
    return this.run('ListManagedPhoneNumbers', () =>
      this.repo.find({ where: { provisionedBy: PhoneProvisionedBy.Managed } }),
    );
  }
}
