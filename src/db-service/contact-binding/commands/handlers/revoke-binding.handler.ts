import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus } from '@app/entities';
import { RevokeBindingCommand } from '../impl/revoke-binding.command';

@CommandHandler(RevokeBindingCommand)
export class RevokeBindingHandler extends BaseCommandHandler<RevokeBindingCommand, ContactBinding | null> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RevokeBindingCommand): Promise<ContactBinding | null> {
    return this.run('RevokeBinding', async () => {
      const binding = await this.repo.findOne({ where: { id: command.id } });
      if (!binding) return null;
      if (binding.status !== ContactBindingStatus.Pending) return binding;
      binding.status = ContactBindingStatus.Revoked;
      return this.repo.save(binding);
    });
  }
}
