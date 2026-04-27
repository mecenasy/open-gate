import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { TenantPhoneNumber } from '@app/entities';
import { IncrementMonthlyMessageCountCommand } from '../impl/increment-monthly-message-count.command';

@CommandHandler(IncrementMonthlyMessageCountCommand)
export class IncrementMonthlyMessageCountHandler extends BaseCommandHandler<IncrementMonthlyMessageCountCommand, void> {
  constructor(
    @InjectRepository(TenantPhoneNumber)
    private readonly repo: Repository<TenantPhoneNumber>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: IncrementMonthlyMessageCountCommand): Promise<void> {
    return this.run('IncrementMonthlyMessageCount', async () => {
      const delta = Math.max(0, Math.trunc(command.delta));
      await this.repo
        .createQueryBuilder()
        .update(TenantPhoneNumber)
        .set({
          monthlyMessageCount: () => `"monthly_message_count" + ${delta}`,
          lastSyncedAt: command.syncedAt,
        })
        .where('tenant_id = :tenantId', { tenantId: command.tenantId })
        .execute();
    });
  }
}
