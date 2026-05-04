import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { PlatformIdentity } from '@app/entities';
import { UpdateLastSeenCommand } from '../impl/update-last-seen.command';

@CommandHandler(UpdateLastSeenCommand)
export class UpdateLastSeenHandler extends BaseCommandHandler<UpdateLastSeenCommand, void> {
  constructor(
    @InjectRepository(PlatformIdentity)
    private readonly repo: Repository<PlatformIdentity>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  async execute(command: UpdateLastSeenCommand): Promise<void> {
    await this.run('UpdateLastSeen', () => this.repo.update({ id: command.id }, { lastSeenAt: command.seenAt }));
  }
}
