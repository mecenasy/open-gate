import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { User } from '../../entity/user.entity';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler extends BaseCommandHandler<RemoveUserCommand, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RemoveUserCommand): Promise<boolean> {
    return this.run('RemoveUser', async () => {
      const result = await this.userRepository.delete({ id: command.id });
      await this.userRepository.delete({ ownerId: command.id });
      return (result?.affected ?? 0) > 0;
    });
  }
}
