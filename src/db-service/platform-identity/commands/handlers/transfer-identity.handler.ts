import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PlatformIdentity } from '@app/entities';
import { TransferIdentityCommand } from '../impl/transfer-identity.command';

@CommandHandler(TransferIdentityCommand)
export class TransferIdentityHandler extends BaseCommandHandler<TransferIdentityCommand, PlatformIdentity | null> {
  constructor(
    @InjectRepository(PlatformIdentity)
    private readonly repo: Repository<PlatformIdentity>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: TransferIdentityCommand): Promise<PlatformIdentity | null> {
    return this.run('TransferIdentity', async () => {
      const row = await this.repo.findOne({ where: { id: command.id } });
      if (!row) return null;
      row.userId = command.newUserId;
      if (command.newPhoneE164 !== null) {
        row.phoneE164 = command.newPhoneE164;
      }
      return this.repo.save(row);
    });
  }
}
