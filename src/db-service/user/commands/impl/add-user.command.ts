import { Command } from '@nestjs/cqrs';
import { AddUserRequest, UserData } from 'src/proto/user';

export class AddUserCommand extends Command<UserData> {
  constructor(public readonly request: AddUserRequest) {
    super();
  }
}
