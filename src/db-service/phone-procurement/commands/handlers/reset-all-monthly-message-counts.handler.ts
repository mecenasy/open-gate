import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PhoneProvisionedBy, TenantPhoneNumber } from '@app/entities';
import { ResetAllMonthlyMessageCountsCommand } from '../impl/reset-all-monthly-message-counts.command';

@CommandHandler(ResetAllMonthlyMessageCountsCommand)
export class ResetAllMonthlyMessageCountsHandler extends BaseCommandHandler<ResetAllMonthlyMessageCountsCommand, void> {
  constructor(
    @InjectRepository(TenantPhoneNumber)
    private readonly repo: Repository<TenantPhoneNumber>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(): Promise<void> {
    return this.run('ResetAllMonthlyMessageCounts', async () => {
      await this.repo
        .createQueryBuilder()
        .update(TenantPhoneNumber)
        .set({ monthlyMessageCount: 0 })
        .where('provisioned_by = :p', { p: PhoneProvisionedBy.Managed })
        .execute();
    });
  }
}
