import { Command } from '@nestjs/cqrs';
import { UserResponse } from 'src/proto/user';
import { CreateSimpleUserType } from '../../dto/create-simple-user.type.';

export class CreateSimpleUserCommand extends Command<UserResponse> {
  constructor(public readonly user: CreateSimpleUserType) {
    super();
  }
}
