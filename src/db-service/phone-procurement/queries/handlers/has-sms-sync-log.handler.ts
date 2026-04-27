import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { SmsSyncLog } from '@app/entities';
import { HasSmsSyncLogQuery } from '../impl/has-sms-sync-log.query';

@QueryHandler(HasSmsSyncLogQuery)
export class HasSmsSyncLogHandler extends BaseQueryHandler<HasSmsSyncLogQuery, boolean> {
  constructor(
    @InjectRepository(SmsSyncLog)
    private readonly repo: Repository<SmsSyncLog>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: HasSmsSyncLogQuery): Promise<boolean> {
    return this.run('HasSmsSyncLog', async () => {
      const found = await this.repo.findOne({ where: { tenantId: query.tenantId, syncDate: query.syncDate } });
      return found !== null;
    });
  }
}
