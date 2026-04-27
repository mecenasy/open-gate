import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { SmsSyncLog } from '@app/entities';
import { InsertSmsSyncLogCommand } from '../impl/insert-sms-sync-log.command';

@CommandHandler(InsertSmsSyncLogCommand)
export class InsertSmsSyncLogHandler extends BaseCommandHandler<InsertSmsSyncLogCommand, void> {
  constructor(
    @InjectRepository(SmsSyncLog)
    private readonly repo: Repository<SmsSyncLog>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: InsertSmsSyncLogCommand): Promise<void> {
    return this.run('InsertSmsSyncLog', async () => {
      // ON CONFLICT DO NOTHING — UNIQUE(tenant_id, sync_date) makes re-runs
      // of the cron a no-op rather than swallowing the count silently.
      await this.repo
        .createQueryBuilder()
        .insert()
        .into(SmsSyncLog)
        .values({
          tenantId: command.tenantId,
          syncDate: command.syncDate,
          messagesCounted: command.messagesCounted,
        })
        .orIgnore()
        .execute();
    });
  }
}
