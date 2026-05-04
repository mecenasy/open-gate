import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus } from '@app/entities';
import { MarkExpiredBindingsCommand } from '../impl/mark-expired-bindings.command';

@CommandHandler(MarkExpiredBindingsCommand)
export class MarkExpiredBindingsHandler extends BaseCommandHandler<MarkExpiredBindingsCommand, number> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: MarkExpiredBindingsCommand): Promise<number> {
    return this.run('MarkExpiredBindings', async () => {
      const qb = this.repo
        .createQueryBuilder()
        .update(ContactBinding)
        .set({ status: ContactBindingStatus.Expired })
        .where('status = :pending AND expires_at < now()', { pending: ContactBindingStatus.Pending });

      // Bulk UPDATE doesn't support LIMIT directly in postgres; if a cap
      // is requested we narrow via subquery so the cron stays bounded.
      if (command.limit > 0) {
        const ids = await this.repo
          .createQueryBuilder('b')
          .select('b.id')
          .where('b.status = :pending AND b.expires_at < now()', { pending: ContactBindingStatus.Pending })
          .limit(command.limit)
          .getMany();
        if (ids.length === 0) return 0;
        qb.andWhere('id IN (:...ids)', { ids: ids.map((b) => b.id) });
      }

      const result = await qb.execute();
      return result.affected ?? 0;
    });
  }
}
