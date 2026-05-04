import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { PlatformIdentity } from '@app/entities';
import { ListIdentitiesByUserQuery } from '../impl/list-identities-by-user.query';

@QueryHandler(ListIdentitiesByUserQuery)
export class ListIdentitiesByUserHandler extends BaseQueryHandler<ListIdentitiesByUserQuery, PlatformIdentity[]> {
  constructor(
    @InjectRepository(PlatformIdentity)
    private readonly repo: Repository<PlatformIdentity>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: ListIdentitiesByUserQuery): Promise<PlatformIdentity[]> {
    return this.run('ListIdentitiesByUser', () => this.repo.find({ where: { userId: query.userId } }));
  }
}
