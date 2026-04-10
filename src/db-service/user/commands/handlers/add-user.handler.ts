import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddUserCommand } from '../impl/add-user.command';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@CommandHandler(AddUserCommand)
export class AddUserHandler implements ICommandHandler<AddUserCommand, UserData> {
  constructor(private readonly userService: UserService) {}

  async execute(command: AddUserCommand): Promise<UserData> {
    const entity = await this.userService.create(command.request);
    return this.userService.entityToProto(entity);
  }
}
