import { Command } from '@nestjs/cqrs';
import { Status, UserData } from 'src/proto/user';

export class UpdateUserStatusCommand extends Command<UserData | null> {
  constructor(
    public readonly id: string,
    public readonly status: Status,
  ) {
    super();
  }
}
