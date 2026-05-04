import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { PlatformIdentity } from '@app/entities';
import { FindByPlatformUserIdQuery } from '../impl/find-by-platform-user-id.query';

@QueryHandler(FindByPlatformUserIdQuery)
export class FindByPlatformUserIdHandler extends BaseQueryHandler<FindByPlatformUserIdQuery, PlatformIdentity | null> {
  constructor(
    @InjectRepository(PlatformIdentity)
    private readonly repo: Repository<PlatformIdentity>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: FindByPlatformUserIdQuery): Promise<PlatformIdentity | null> {
    return this.run('FindByPlatformUserId', () =>
      this.repo.findOne({
        where: {
          tenantId: query.tenantId,
          platform: query.platform,
          platformUserId: query.platformUserId,
        },
      }),
    );
  }
}
