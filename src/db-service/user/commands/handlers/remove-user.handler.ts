import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { User } from '../../entity/user.entity';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler implements ICommandHandler<RemoveUserCommand, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: RemoveUserCommand): Promise<boolean> {
    const result = await this.userRepository.delete({ id: command.id });
    await this.userRepository.delete({ ownerId: command.id });
    return (result?.affected ?? 0) > 0;
  }
}
