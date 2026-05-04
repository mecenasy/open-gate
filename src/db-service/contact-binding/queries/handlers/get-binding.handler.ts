import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { ContactBinding } from '@app/entities';
import { GetBindingQuery } from '../impl/get-binding.query';

@QueryHandler(GetBindingQuery)
export class GetBindingHandler extends BaseQueryHandler<GetBindingQuery, ContactBinding | null> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetBindingQuery): Promise<ContactBinding | null> {
    return this.run('GetBinding', () => this.repo.findOne({ where: { id: query.id } }));
  }
}
