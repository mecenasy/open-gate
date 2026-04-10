import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../impl/remove-user.command';
import { UserService } from '../../user.service';

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler implements ICommandHandler<RemoveUserCommand, boolean> {
  constructor(private readonly userService: UserService) {}

  execute(command: RemoveUserCommand): Promise<boolean> {
    return this.userService.remove(command.id);
  }
}
