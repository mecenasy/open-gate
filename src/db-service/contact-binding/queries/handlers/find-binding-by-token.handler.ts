import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus } from '@app/entities';
import { FindBindingByTokenQuery } from '../impl/find-binding-by-token.query';

@QueryHandler(FindBindingByTokenQuery)
export class FindBindingByTokenHandler extends BaseQueryHandler<FindBindingByTokenQuery, ContactBinding | null> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: FindBindingByTokenQuery): Promise<ContactBinding | null> {
    return this.run('FindBindingByToken', () => {
      if (query.onlyActive) {
        return this.repo.findOne({
          where: { token: query.token, status: ContactBindingStatus.Pending, expiresAt: MoreThan(new Date()) },
        });
      }
      return this.repo.findOne({ where: { token: query.token } });
    });
  }
}
