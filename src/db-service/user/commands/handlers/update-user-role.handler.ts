import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserRoleCommand } from '../impl/update-user-role.command';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand, UserData | null> {
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserRoleCommand): Promise<UserData | null> {
    const entity = await this.userService.updateRole(command.id, command.type);
    return entity ? this.userService.entityToProto(entity) : null;
  }
}
