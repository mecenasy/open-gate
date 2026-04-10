import { Command } from '@nestjs/cqrs';
import { UserData, UserType } from 'src/proto/user';

export class UpdateUserRoleCommand extends Command<UserData | null> {
  constructor(
    public readonly id: string,
    public readonly type: UserType,
  ) {
    super();
  }
}
