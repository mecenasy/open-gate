import { Command } from '@nestjs/cqrs';
import { UserResponse } from 'src/proto/user';
import { CreateUserType } from '../../dto/create-user.type.';

export class CreateUserCommand extends Command<UserResponse> {
  constructor(public readonly user: CreateUserType) {
    super();
  }
}
