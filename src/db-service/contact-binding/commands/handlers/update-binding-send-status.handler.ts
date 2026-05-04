import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ContactBinding } from '@app/entities';
import { UpdateBindingSendStatusCommand } from '../impl/update-binding-send-status.command';

@CommandHandler(UpdateBindingSendStatusCommand)
export class UpdateBindingSendStatusHandler extends BaseCommandHandler<
  UpdateBindingSendStatusCommand,
  ContactBinding | null
> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdateBindingSendStatusCommand): Promise<ContactBinding | null> {
    return this.run('UpdateBindingSendStatus', async () => {
      const binding = await this.repo.findOne({ where: { id: command.id } });
      if (!binding) return null;
      binding.sendStatus = command.sendStatus;
      binding.outboundMessageId = command.outboundMessageId;
      binding.sendError = command.sendError;
      return this.repo.save(binding);
    });
  }
}
