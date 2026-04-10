import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/update-user.command';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserData | null> {
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserCommand): Promise<UserData | null> {
    const entity = await this.userService.update(command.id, command.data);
    return entity ? this.userService.entityToProto(entity) : null;
  }
}
