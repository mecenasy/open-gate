import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand, UserData | null> {
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserStatusCommand): Promise<UserData | null> {
    const entity = await this.userService.updateStatus(command.id, command.status);
    return entity ? this.userService.entityToProto(entity) : null;
  }
}
