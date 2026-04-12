import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { User } from '../../entity/user.entity';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler implements ICommandHandler<RemoveUserCommand, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RemoveUserHandler.name);
  }

  async execute(command: RemoveUserCommand): Promise<boolean> {
    this.logger.log('Executing RemoveUser');

    try {
      const result = await this.userRepository.delete({ id: command.id });
      await this.userRepository.delete({ ownerId: command.id });
      return (result?.affected ?? 0) > 0;
    } catch (error) {
      this.logger.error('Error executing RemoveUser', error);
      throw error;
    }
  }
}
