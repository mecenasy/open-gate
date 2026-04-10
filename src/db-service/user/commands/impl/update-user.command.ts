import { Command } from '@nestjs/cqrs';
import { UserData } from 'src/proto/user';

export class UpdateUserCommand extends Command<UserData | null> {
  constructor(
    public readonly id: string,
    public readonly data: Partial<UserData>,
  ) {
    super();
  }
}
